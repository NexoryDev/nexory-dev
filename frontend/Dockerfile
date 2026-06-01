FROM node:20-alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
RUN npm install react-icons
RUN npm install lucide-react
RUN npm install three
RUN npm install @react-three/fiber
RUN npm install @react-three/drei
RUN npm install @react-three/postprocessing
RUN npm install framer-motion
RUN npm install gsap
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
