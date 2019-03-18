export function requestInvoice(lines) {
  return fetch('/api/invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lines),
  }).then(res => res.json());
}