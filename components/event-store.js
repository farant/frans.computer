function uuid() {
	return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
		(
			c ^
			(crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
		).toString(16)
	);
}

export class EventStore {
	static write_event(event_name, data) {
		let { entity_id, entity_type, payload } = data;
		if (!entity_id) {
			entity_id = uuid();
		}
		let events = [];

		try {
			let raw_saved = localStorage.getItem("event-store");
			if (raw_saved) {
				let saved_events = JSON.parse(raw_saved);
				events = saved_events;
			}
		} catch (e) {
			console.error(
				"Unable to write event, error loading saved events: ",
				e
			);
			return null;
		}

		let event_number = 1;

		if (events.length > 0) {
			let last_event = events[events.length - 1];
			event_number = last_event.event_number + 1;
		}

		let new_event = {
			event_number,
			event_name,
			event_id: uuid(),
			stream: `${entity_type}--${entity_id}`,
			created_at: new Date().getTime(),
			data: payload,
		};

		console.log("new_event", new_event);

		events.push(new_event);

		localStorage.setItem("event-store", JSON.stringify(events));
	}

	static get_events() {
		let events = [];
		try {
			events = JSON.parse(localStorage.getItem("event-store"));
		} catch {}

		return events;
	}

	static get_events_for_category(category_name) {
		return EventStore.get_events().filter((e) => {
			let category = e.stream.split("--")[0];
			return category === category_name;
		});
	}
}
