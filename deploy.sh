#!/bin/sh
echo "Starting deployment";
ssh website-internal.whitespell.com "sudo mkdir -p /var/www/manage.peakapp.me && sudo chmod -R 777 /var/www/manage.peakapp.me";
scp -r www/* website-internal.whitespell.com:/var/www/manage.peakapp.me;
ssh website-internal.whitespell.com "sudo chmod -R 755 /var/www/manage.peakapp.me";
echo "Deployment Successful";