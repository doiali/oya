# Oya

save your daily activities


## run backend
---
you should have python3.10 and postgreSQL installed.  
edit .env file and enter your postgreSQL username and password  
you should have a database called oya. you can change the database name in app/database.py.  

open your terminal and go to oya-back.  
then create a virtual environment:  
```
py -m venv venv
```
activate the virtual environment using  
```
.\venv\Scripts\Activate
```
install the requirements:
```
py -m pip install -r requirements.txt
```
now you can run the server using:
```
uvicorn app.main:app --reload
```

## run frontend
---
you should have nodeJs > v.16.13.0 installed.  
install serve and yarn globally using your terminal:

```
npm install -g yarn serve
```

open your terminal and go to oya-web.  
install the node_modules using
```
yarn install
```

to run development server, use
```
yarn start
```

to create a production build, use:
```
yarn build
```

then to run the production server, use:
```
serve -s build
```

now if you have both backend and frontend servers running, you can open your browser and go to [localhost:3000](http://localhost:3000/) and see the application


