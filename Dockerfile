# 1. نستعمل image ديال Node
FROM node:20-bullseye

# 2. نحدد workdir
WORKDIR /usr/src/app

# 3. ننسخ package.json + lock
COPY package*.json ./

# 4. نثبت dependencies
RUN npm install

# 5. نثبت المتصفحات ديال Playwright
RUN npx playwright install --with-deps

# 6. ننسخ باقي الكود
COPY . .

# 7. نعرض البورت
EXPOSE 3000

# 8. تشغيل التطبيق
CMD ["npm", "start"]
