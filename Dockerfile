# Kita pakai Alpine XFCE biar super ringan buat RAM server
FROM lscr.io/linuxserver/webtop:alpine-xfce

# Setup zona waktu dan perizinan user
ENV PUID=1000
ENV PGID=1000
ENV TZ=Asia/Jakarta

# Buka port 3000 (Port wajib Webtop) biar Railway bisa bikin link webnya
EXPOSE 3000
