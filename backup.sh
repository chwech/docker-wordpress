#!/bin/sh

startTime=$(date +%Y-%m-%d\ %H:%M:%S)
logPath="/home/chwech/docker/wordpress/backup.log"

# 以追加的方式，把 command 的正确输出结果输出到 file 文件中。
echo "--${startTime} 开始备份数据库--" >> ${logPath}
echo "--${startTime} 执行mysql备份命令中...--" >> ${logPath}
docker-compose exec mysql /var/lib/mysql/backup.sh >> ${logPath}
# 如果上一个命令的退出状态是0， 即正常执行退出时
if [ "$?" == 0 ]; then
  cd /home/chwech/docker/wordpress/mysql-data
  tar zcf wordpress.tar.gz wordpress.sql > /dev/null
  rm -f wordpress.sql
  echo "-- 备份数据库完成--" >> ${logPath}
else
  echo "-- 备份数据库失败--" >> ${logPath}
fi

