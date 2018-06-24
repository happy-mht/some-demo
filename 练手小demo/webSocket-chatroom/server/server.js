const http = require('http');
const mysql = require('mysql');
const io = require('socket.io');
const fs = require('fs');
const reg = require('../src/reg.js');

let db = mysql.createPool({
	host:'localhost',
	user:'mht',
	password:'123456',
	database:'20180624'
});

let cur_usr = '';
let sockArr = [];

let httpServer = http.createServer((req,res)=>{

	fs.readFile(`../web/www${req.url}`, (err, data)=>{
      if(err){
      	console.log(err)
      	res.writeHeader(404)
      	res.write(JSON.stringify({code:1,msg:'file-read-error'}));
      	res.end()
      }else{
      	res.write(data)
      	res.end()
      }
	});
    
}).listen(8000); 

let ws = io.listen(httpServer)
ws.on('connection',sock=>{
	
	//注册 
	//@param String username
	//@param String password
	sock.on('reg',(username,password)=>{

		//1. 校验数据
		if(!reg.username.test(username)){
			sock.emit('reg_res',1,'用户名不合法')
		}else if(!reg.password.test(password)){
			sock.emit('reg_res',1,'密码不合法')
		}else{

			// 查询用户名是否存在
			db.query(`select ID from user_table where username='${username}'`, (err,data)=>{
				if(err){
					console.log(err)
					sock.emit('reg_res',1,'数据库错误')
				}else if(data.length > 0){
					sock.emit('reg_res',1,'该用户名已经存在')
				}else{
					// 插入数据
					db.query(`insert into user_table (username,password,online) values('${username}','${password}',0)`,err=>{
						if(err){
							console.log(err);
							sock.emit('reg_res',1,'数据库错误')
						}else{
							sock.emit('reg_res',0,'注册成功')
						}
					})
					
				}
			})
		}
	   
	})

	//登录 
	//@param String username
	//@param String password
	sock.on('login',(username,password)=>{

		//1. 校验数据
		if(!reg.username.test(username)){
			sock.emit('login_res',1,'用户名不合法')
		}else if(!reg.password.test(password)){
			sock.emit('login_res',1,'密码不合法')
		}else{
			
			// 查询用户名是否存在
			db.query(`select password,ID from user_table where username='${username}'`, (err,data)=>{
				if(err){
					console.log(err)
					sock.emit('login_res',1,'数据库错误')
				}else if(data.length === 0){
					sock.emit('login_res',1,'不存在用户名')
				}else if(data[0].password != password){
					sock.emit('login_res',1,'用户名或密码错误')
				}else{
					// 修改在线状态
					db.query(`update user_table set online=1 where username='${username}'`,err=>{
						if(err){
							console.log(err)
							sock.emit('login_res',1,'数据库错误')
						}else{
							cur_usr = username;
							sockArr.push(sock)
							sock.emit('login_res',0,username)
						}
					})
				}
			})
		}
	   
	})

    //离线
	//@param String username
	//@param String password
	sock.on('disconnecting',()=>{
			
		db.query(`update user_table set online=0 where username='${cur_usr}'`,err=>{
			if(err){
				console.log(err)
			}else{
				cur_usr = ''
			}
		})
	})

	// 发送消息
	sock.on('msg',(username,txt)=>{
		if(!txt.trim()){
			sock.emit('msg_res',1,'消息不能为空')
		}else{
			console.log(sockArr.length,username,cur_usr)
			sockArr.forEach(item=>{
				console.log(item == sock)
				if(item == sock) return;
				console.log(1)
				item.emit('msg',0,cur_usr,txt)
			})
			sock.emit('msg_res',0,cur_usr,txt)
		}
	})

})

