#!/bin/sh

startTime=$(date +%Y-%m-%d\ %H:%M:%S)
logPath="/home/chwech/learn-docker/wordpress/backup.log"
echo "--${startTime} 开始备份数据库--" >> ${logPath}

docker-compose exec mysql /var/lib/mysql/backup.sh >> ${logPath}

if [ "$?" == 0 ]; then
cd /home/chwech/learn-docker/wordpress/mysql-data
tar zcf wordpress.tar.gz wordpress.sql > /dev/null
rm -f wordpress.sql
fi
