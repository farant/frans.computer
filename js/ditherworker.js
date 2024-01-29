onmessage = function (e) {
  const result = dither(
    e.data.imageData,
    e.data.pixelSize,
    e.data.cutoff,
    e.data.dither_variant,
    e.data.custom_colors
  );
  const reply = {};
  reply.imageData = result;
  reply.pixelSize = e.data.pixelSize;
  reply.cutoff = e.data.cutoff;
  reply.repaint_id = e.data.repaint_id;
  postMessage(reply);
};

function dither(imageData, scaleFactor, cutoff, dither_variant, custom_colors) {
  let output = new ImageData(
    imageData.width * scaleFactor,
    imageData.height * scaleFactor
  );
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] =
      imageData.data[i + 1] =
      imageData.data[i + 2] =
        Math.floor(
          imageData.data[i] * 0.3 +
            imageData.data[i + 1] * 0.59 +
            imageData.data[i + 2] * 0.11
        );
  }

  // most implementations I see just distribute error into the existing image, wrapping around edge pixels
  // this implementation uses a sliding window of floats for more accuracy (probably not needed really)

  let slidingErrorWindow = [
    new Float32Array(imageData.width),
    new Float32Array(imageData.width),
    new Float32Array(imageData.width),
  ];
  const offsets = [
    [1, 0],
    [2, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
    [0, 2],
  ];

  let COLORS = {
    duotone_colors: `
    rgb(240, 233, 210)
    rgb(223, 210, 175)
    rgb(103, 137, 131)
    rgb(24, 29, 49)
  `,
    basic_monotone: `
    rgb(246, 242, 228)
    rgb(223, 210, 175)
    rgb(192, 153, 98)
    rgb(74, 46, 22)
  `,
    browns: `
    rgb(136, 74, 57)
rgb(195, 129, 84)
rgb(255, 194, 111)
rgb(249, 224, 187)
    `,
    pink: `
    rgb(255, 120, 196)
rgb(225, 174, 255)
rgb(255, 189, 247)
rgb(255, 236, 236)
    `,
    blues: `
    rgb(14, 41, 84)
    rgb(31, 110, 140)
    rgb(46, 138, 153)
    rgb(132, 167, 161)
    `,
  };

  let raw_colors = COLORS.duotone_colors;

  if (COLORS[dither_variant]) {
    raw_colors = COLORS[dither_variant];
  } else if (custom_colors[0]) {
    raw_colors = `
    ${custom_colors[0]}
    ${custom_colors[1]}
    ${custom_colors[2]}
    ${custom_colors[3]}
  `;
  }

  console.log({ dither_variant });
  /*
    raw_colors = `
      rgb(247, 236, 222)
  rgb(233, 218, 193)
  rgb(158, 210, 198)
  rgb(84, 186, 185)
      `;
      */
  //rgb(188, 145, 103)
  //rgb(255, 254, 219)
  //

  let colors = raw_colors
    .trim()
    .split("\n")
    .map((raw) => {
      return raw.split(",").map((c) => +c.replace(/\D/g, ""));
    });

  colors.sort((a, b) => {
    return a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]);
  });

  console.log({ colors });

  for (let y = 0, limY = imageData.height; y < limY; ++y) {
    for (let x = 0, limX = imageData.width; x < limX; ++x) {
      let i = (y * limX + x) * 4;
      let accumulatedError = Math.floor(slidingErrorWindow[0][x]);
      let expectedMono = imageData.data[i] + accumulatedError;
      let monoValue = expectedMono;

      // let breakpoints = [120 /*95*/, 160 /*140*/, 192];
      let breakpoints = [95, 145, 192];
      let grays = [0, 85, 170, 255];
      let color_index = 0;

      if (monoValue < breakpoints[0]) {
        monoValue = grays[0];
        color_index = 0;
      } else if (monoValue < breakpoints[1]) {
        monoValue = grays[1];
        color_index = 1;
      } else if (monoValue < breakpoints[2]) {
        monoValue = grays[2];
        color_index = 2;
      } else {
        monoValue = grays[3];
        color_index = 3;
      }

      /*
        if (monoValue <= Math.floor(cutoff * 255)) {
          monoValue = 0;
        } else {
          monoValue = 255;
        }
              */

      let error = (expectedMono - monoValue) / 8.0;
      for (let q = 0; q < offsets.length; ++q) {
        let offsetX = offsets[q][0] + x;
        let offsetY = offsets[q][1] + y;
        if (offsetX >= 0 && offsetX < slidingErrorWindow[0].length)
          slidingErrorWindow[offsets[q][1]][offsetX] += error;
      }

      // this is stupid but we have to do the pixel scaling ourselves because safari insists on interpolating putImageData
      // which gives us blurry pixels (and it doesn't support the createImageBitmap call with an ImageData instance which
      // would make this easy)

      for (let scaleY = 0; scaleY < scaleFactor; ++scaleY) {
        let pixelOffset =
          ((y * scaleFactor + scaleY) * output.width + x * scaleFactor) * 4;
        for (let scaleX = 0; scaleX < scaleFactor; ++scaleX) {
          output.data[pixelOffset] = colors[color_index][0];
          output.data[pixelOffset + 1] = colors[color_index][1];
          output.data[pixelOffset + 2] = colors[color_index][2];
          // output.data[pixelOffset] =
          //   output.data[pixelOffset + 1] =
          //   output.data[pixelOffset + 2] =
          //     monoValue;

          output.data[pixelOffset + 3] = 255;
          /*

          Uncomment if you want transparent pixels
          if (color_index == 3) {
            output.data[pixelOffset + 3] = 0;
          } else {
            output.data[pixelOffset + 3] = 255;
            }
            */

          pixelOffset += 4;
        }
      }
    }
    // move the sliding window
    slidingErrorWindow.push(slidingErrorWindow.shift());
    slidingErrorWindow[2].fill(0, 0, slidingErrorWindow[2].length);
  }
  return output;
}
