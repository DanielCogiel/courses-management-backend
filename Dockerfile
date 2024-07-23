FROM mysql:8.0
ENV MYSQL_TCP_PORT $MYSQL_TCP_PORT
COPY database-config.sh.dist /docker-entrypoint-initdb.d/database-config.sh
EXPOSE $MYSQL_TCP_PORT