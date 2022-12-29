import { Avatar } from 'antd';
import style from '../styles/Mess.module.css';
const Mess = ({
	src,
	text,
	right,
}: {
	src: string;
	text: string;
	right?: boolean;
}) => {
	return (
		<div className={right ? style.right + ' ' + style.card : style.card}>
			<Avatar src={src}></Avatar>
			<div className={style.text}>{text}</div>
		</div>
	);
};
export default Mess;
