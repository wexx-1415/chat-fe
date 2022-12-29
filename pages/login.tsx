import { Button, Form, Input, Layout, message } from 'antd';
import Image from 'next/image';
import Router from 'next/router';
import { useEffect, useState } from 'react';
import style from '../styles/Login.module.css';
import { hasToken } from '../util/Token';
const login = (email: string, pass: string, action: 'login' | 'signup') => {
	const word = action === 'login' ? '登录' : '注册';
	fetch(`http://localhost.charlesproxy.com:3000/user/${action}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email: email, pass: pass }),
	}).then((res) => {
		if (res.ok) {
			res.json().then((data) => {
				console.log(data);
				if (data.code === 200) {
					message.success(`${word}成功`);
					localStorage.setItem('user', JSON.stringify(data.data));
					Router.push('/');
				} else {
					message.error(data.msg);
				}
			});
		} else {
			message.error(`${word}失败`);
		}
	});
};

const { Content } = Layout;
const onFinishFailed = (errorInfo: any) => {
	console.log('Failed:', errorInfo);
};
const Login = () => {
	const [islogin, setIslogin] = useState(true);
	const onFinish = (values: { email: string; pass: string }) => {
		if (islogin) login(values.email, values.pass, 'login');
		else login(values.email, values.pass, 'signup');
	};
	useEffect(() => {
		if (hasToken()) {
			Router.push('/');
		}
	});
	return (
		<Form
			labelCol={{ span: 8 }}
			wrapperCol={{ span: 16 }}
			onFinish={onFinish}
			onFinishFailed={onFinishFailed}
		>
			<Form.Item
				label={'email'}
				name={'email'}
				rules={[
					{ type: 'email', message: '输入正确的Email' },
					{ required: true, message: '请输入邮箱' },
				]}
			>
				<Input />
			</Form.Item>
			<Form.Item
				label='密码'
				name={'pass'}
				rules={[{ required: true, message: '请输入密码' }]}
			>
				<Input.Password></Input.Password>
			</Form.Item>
			<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
				<Button
					type='primary'
					onClick={() => setIslogin(true)}
					htmlType='submit'
				>
					登录
				</Button>
				<Button
					type='default'
					onClick={() => setIslogin(false)}
					htmlType='submit'
				>
					注册
				</Button>
			</Form.Item>
		</Form>
	);
};

const App = () => {
	return (
		<Content className={style.main}>
			<Image
				alt='login'
				width={192 * 3.5}
				height={108 * 3.5}
				src={'/(pid-29100736)桜の蜜.png'}
			></Image>
			<Login />
		</Content>
	);
};

export default App;
