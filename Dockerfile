# Ganti dari alpine-xfce ke ubuntu-xfce yang dijamin stabil
FROM lscr.io/linuxserver/webtop:ubuntu-xfce

# Setup zona waktu dan perizinan user
ENV PUID=1000
ENV PGID=1000
ENV TZ=Asia/Jakarta

# Buka port 3000 (Port wajib Webtop) biar Railway bisa bikin link webnya
EXPOSE 3000
