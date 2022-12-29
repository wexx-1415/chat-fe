import { Inter } from '@next/font/google';
import { Avatar, Card, Input, Layout, List, message, Modal, Tabs } from 'antd';
import { nanoid } from 'nanoid';

import Head from 'next/head';
import Router from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Mess from '../components/Mess';
import style from '../styles/Home.module.css';
import { getToken, hasToken } from '../util/Token';
const inter = Inter({ subsets: ['latin'] });
interface Msg {
	peo: 'you' | 'me';
	msg: string;
	id: string;
}
let messages = new Map<string, Msg[]>();
const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
interface User {
	_id: string;
	email: string;
	friends?: string[];
	token?: string;
	pass?: string;
	// friends: User[];
}
const socket = io('http://localhost:3000');

const White = () => <div>select a friend</div>;
const url = 'http://localhost:3000';
export default function Home() {
	const [content, setContent] = useState('');
	const [friends, setFriends] = useState<User[]>([]);
	const [open, setOpen] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [modalText, setModalText] = useState('Content of the modal');
	const [friend, setFriend] = useState<string>('');
	const [talk, setTalk] = useState<string>('');
	const [users, setUsers] = useState<User[]>([]);
	const [user, setUser] = useState<User | null>(null);
	const [text, setText] = useState<string>('');
	useEffect(() => {
		if (!hasToken()) {
			Router.push('/login');
		}
		fetch(`${url}/user`).then((res) => {
			if (res.status == 200)
				res.json().then((data) => {
					setUsers(data);
				});
		});
	}, []);
	const comMsg = useCallback(
		(message: string, to: string, peo: 'me' | 'you') => {
			// socket.emit('link', user?.email);
			socket.emit('chat', { message: message, to: to });
			if (messages.get(to) == undefined) {
				messages.set(to, [{ peo: peo, msg: message, id: nanoid() }]);
			} else {
				messages.set(
					to,
					messages.get(to)!.concat({ peo: peo, msg: message, id: nanoid() })
				);
			}
			setMsg(messages.get(to)!);
		},
		[user]
	);
	useEffect(() => {
		if (!user) return;
		socket.on('connect', () => {
			console.log('connect');
		});
		socket.emit('link', user?.email);
		socket.on('chat from', (data: { message: string; from: string }) => {
			console.log(data);
			setTalk(data.from);
			setContent(data.from);
			if (messages.get(data.from) == undefined) {
				messages.set(data.from, [
					{ peo: 'you', msg: data.message, id: nanoid() },
				]);
			} else {
				messages.set(
					data.from,
					messages
						.get(data.from)!
						.concat({ peo: 'you', msg: data.message, id: nanoid() })
				);
			}
			setMsg(messages.get(data.from)!);
			// comMsg(data.message, data.from, 'you');
		});
		return () => {
			socket.off('chat');
			socket.off('connect');
			socket.off('link');
			socket.off('chat from');
		};
	}, [user]);
	const [msg, setMsg] = useState<Msg[]>([]);

	const addFriend = (id: string) => {
		if (friends.find((user) => user._id == id)) {
			message.error('已经是好友了');
			return;
		}
		fetch(`${url}/user/${user?._id}/friends`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ friendId: id }),
		}).then((res) => {
			if (res.ok) {
				console.log(friends);
				setFriends([...friends, users.find((user) => user._id == id)!]);
				message.success('添加成功');
			} else {
				message.error('添加失败');
			}
		});
	};
	useEffect(() => {
		const user = getToken();
		if (user == null) {
			Router.push('/login');
		} else {
			console.log(user);
			setUser(user);
			fetch(`${url}/user/${user?._id}`).then((res) => {
				if (res.status == 200)
					res.json().then((data) => setFriends(data.friends || []));
			});
		}
	}, []);
	const handleOk = (id: string) => {
		setConfirmLoading(true);
		addFriend(id);
		setConfirmLoading(false);
		setOpen(false);
	};
	const List1 = () => {
		return (
			<List
				split={false}
				itemLayout='horizontal'
				dataSource={friends}
				renderItem={(item) => (
					<List.Item
						onClick={() => {
							setContent(item.email);
							console.log(item);
							setMsg(messages.get(item.email) || []);
							setTalk(item.email);
						}}
					>
						<Card hoverable style={{ width: '100%', padding: '0px' }}>
							<List.Item.Meta
								avatar={<Avatar src={'/thirteen.svg'} />}
								title={item.email.slice(0, item.email.indexOf('@'))}
								// description='description'
							></List.Item.Meta>
						</Card>
					</List.Item>
				)}
			></List>
		);
	};
	const List2 = () => {
		return (
			<List
				split={false}
				itemLayout='horizontal'
				dataSource={users.filter((user) => {
					return friends.find((friend) => friend._id == user._id) == undefined;
				})}
				renderItem={(item) => (
					<List.Item>
						<Card
							hoverable
							style={{
								width: '100%',
								padding: '0px',
							}}
							onClick={() => {
								setOpen(true);
								setFriend(item._id);
								setContent(item.email);
								setModalText(item.email);
							}}
						>
							<List.Item.Meta
								avatar={<Avatar src={'/thirteen.svg'} />}
								title={item.email.slice(0, item.email.indexOf('@'))}
								// description='description'
							></List.Item.Meta>
						</Card>
						{/* <Avatar src={item}></Avatar> */}
					</List.Item>
				)}
			></List>
		);
	};
	const ref = useRef<HTMLElement>(null);
	useEffect(() => {
		if (ref.current) {
			ref.current.scrollTop = ref.current.scrollHeight;
		}
	}, [msg]);
	return (
		<>
			<Head>
				<title>chat with others!</title>
				<meta name='description' content='Generated by create next app' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<Layout>
				<Sider
					style={{ background: 'white', height: '100vh', overflow: 'auto' }}
				>
					<Tabs
						tabPosition='top'
						animated
						centered
						size='large'
						defaultActiveKey='1'
						items={[
							{ key: '1', label: '你的好友', children: <List1 /> },
							{ key: '2', label: '所有用户', children: <List2 /> },
						]}
					></Tabs>
				</Sider>
				<Layout>
					<Header
						style={{
							background: 'white',
							height: '57px',
							textAlign: 'center',
							fontWeight: 'bold',
						}}
					>
						{content}
					</Header>
					<Content ref={ref} className={style.content}>
						{talk == '' ? (
							<White></White>
						) : (
							<>
								{msg.map((item) => {
									return (
										<Mess
											src='/thirteen.svg'
											text={item.msg}
											right={item.peo == 'me'}
											key={item.id}
										></Mess>
									);
								})}
								<TextArea
									// showCount
									onChange={(e) => {
										setText(e.target.value);
									}}
									value={text}
									onPressEnter={(e) => {
										e.preventDefault();
										comMsg(text, talk, 'me');
										setText('');
									}}
									allowClear
									rows={6}
									style={{ position: 'sticky', top: ' calc(100vh - 264px)' }}
								/>
							</>
						)}
					</Content>
				</Layout>
			</Layout>
			<Modal
				title='添加好友'
				open={open}
				onOk={() => handleOk(friend)}
				onCancel={() => {
					setOpen(false);
				}}
				confirmLoading={confirmLoading}
			>
				<p>添加{modalText}为好友</p>
			</Modal>
		</>
	);
}
