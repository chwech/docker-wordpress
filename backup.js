#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
const nodemailer = require("nodemailer")

const workDir = process.cwd()
const logPath = path.join(workDir, 'log.txt')
const backupPath = path.join(workDir, 'backup.zip')
const sqlFileName = path.join(workDir, 'wordpress.sql')

function log(str, { out = true } = {}) {
  try {
    console.log(str)
    if (out) {
      fs.appendFileSync(logPath, str + '\r\n')
    }
  } catch (error) {
    console.log(error)
  }
}

async function sendEmail ({ text, attachments }) {
  let transporter = nodemailer.createTransport({
    service: '163',
    auth: {
      user: '13672615289@163.com',
      pass: 'ggi3h8ggi3h8'
    }
  })
  var message = {
    from: {
      name: 'chwech',
      address: '13672615289@163.com'
    },
    to: "804699297@qq.com",
    subject: "备份结果通知",
    text: text,
    attachments: attachments
  }
  try {
    await transporter.sendMail(message)
  } catch {
    log('发送通知邮件失败')
  }
}

function getDateTime () {
  let startTime = new Date()
  let s = startTime.toLocaleDateString()
  let t = startTime.toLocaleTimeString()
  return s + ' ' + t
}

function execCommand(command, { out = true } = {}) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if(err) {
        if (out) {
          log(`执行命令"${command}"出错\r\n错误信息：\r\n${err}`);
          log(`stderr: ${stderr}`)
        }
        reject({ stderr, err })
        return;
      }
      if (out) {
        log(`执行命令${command}成功`)
      }
      resolve()
    })
  })
}

async function run () {
  log('备份开始执行时间：' + getDateTime())
  log('当前工作目录：' + workDir)
  try {
    // 导出mysql数据
    await execCommand(`docker-compose exec -T mysql mysqldump -uroot -padmin-chwech wordpress > ${sqlFileName}`)
    log('导出数据库成功')
    log('备份程序结束时间: ' + getDateTime())
    log('---------------------------------------------------------------------------------')
    // 压缩日志和sql文件
    await execCommand(`zip -m ${backupPath} ${sqlFileName} ${logPath}`, { out: false })
    // 发送邮件
    await sendEmail({ 
      text: '备份成功',
      attachments: [
        {
          filename: 'backup.zip',
          content: fs.createReadStream(backupPath)
        }
      ]})
  } catch (error) {
    log('备份失败')
    await execCommand(`rm -f ${sqlFileName}`) // 删掉wordpress.sql
    log('备份程序结束时间: ' + getDateTime())
    log('---------------------------------------------------------------------------------')
    await sendEmail({ 
      text: '备份失败',
      attachments: [
        {
          filename: 'log.txt',
          content: fs.createReadStream(logPath)
        }
      ]
    })
  } finally {
    await execCommand(`rm -f ${logPath}`, { out: false })
    await execCommand(`rm -f ${backupPath}`, { out: false })
  }
}

run()
