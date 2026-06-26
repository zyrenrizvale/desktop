FROM lscr.io/linuxserver/kasmvnc:latest

# Setting biar jalan tanpa masalah perizinan
ENV PUID=1000
ENV PGID=1000
ENV TZ=Asia/Jakarta

# Buka port 3000
EXPOSE 3000
