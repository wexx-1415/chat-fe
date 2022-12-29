const hasToken = () => {
	const token = localStorage.getItem('user');
	return token !== null;
};
const getToken = (): {
	_id: string;
	email: string;
	token: string;
	
} | null => {
	const token = localStorage.getItem('user');
	if (token === null) {
		return null;
	}
	return JSON.parse(token);
};
const delToken = () => {
	localStorage.removeItem('user');
};
export { hasToken, getToken, delToken };
