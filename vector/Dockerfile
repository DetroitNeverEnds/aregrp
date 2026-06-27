FROM timberio/vector:latest-alpine

RUN apk add --no-cache logrotate dcron

# Install logrotate config
COPY logrotate.conf /etc/logrotate.d/aregrp

# Set up daily cron job at 02:00
RUN mkdir -p /var/spool/cron/crontabs && \
    echo "0 2 * * * logrotate /etc/logrotate.conf" > /var/spool/cron/crontabs/root && \
    chmod 600 /var/spool/cron/crontabs/root

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["--config", "/etc/vector/vector.toml"]
