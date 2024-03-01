export function jsonToCSV(jsonArray: any[]): string {
	if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
		return '';
	}

	const headers = Object.keys(jsonArray[0]);

	const rows = jsonArray.map(obj => {
		return headers.map(fieldName => {
			let field = obj[fieldName] === null || obj[fieldName] === undefined ? '' : obj[fieldName];
			return `"${field.toString().replace(/"/g, '""')}"`;
		}).join(',');
	});

	return [headers.join(','), ...rows].join('\r\n');
}
export function csvToJSON(csvString: string) {
	// Split the string into an array of lines
	const lines = csvString.split('\r\n').filter(line => line.trim() !== '');
	


	
	// Extract headers
	const headers = lines[0].split(',');

	// Map the remaining lines to objects
	return lines.slice(1).map(line => {
		const data = line.split(',');
		return headers.reduce((obj: { [key: string]: string }, nextKey, index) => {
			obj[nextKey] = data[index].replace(/"/g, '');
			return obj;
		}, {});
	});
}
