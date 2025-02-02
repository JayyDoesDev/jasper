export function respond(o: Object): Response {
	return new Response(JSON.stringify(o));
}
