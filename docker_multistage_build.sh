#!/usr/bin/env bash
sudo docker build -f Dockerfile_prod -t kimios-angular-fuse-prod . --build-arg backendURL=http://localhost:8181
