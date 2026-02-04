# live link https://crazyeight-fe-be.vercel.app/

# what this is ?
- this is a classic crazy eight card game implimentation you can learn more about the game here (https://bicyclecards.com/how-to-play/crazy-eights) many say UNO is inspired by this game
- i made this game to learn more about how distrubuted systems work i used redis as the single source of truth for the game state and socket.io and nodejs as the backend for game logic

# stack
- Redis with Redis Adapter(i used redis because well its is very fast and cheap and easy to deploy,ofc sql lite  would have worked fine but it would just have increased the complexity since we dont need relational database for game state and we need to update it quite frequently ,plus key value databases are preffered over relational databases because we are not performing complex queries on the data in database itself but rather on backend so each operation is cheaper than doing it in database itself)
- nodejs  (nodejs is lightweight and pretty fast compared to java spring or c# net which would have been a total overkill for this project its just a simple card game under the hood and it is very IO heavy so i went with nodejs since it is one of the most logical choice and for why not go lang ? because i dont need to increase complexity even tho go has better tooling for this i was able to develope this whole game in single language(typescript))
- socketio (i went with socket io instead of raw websockets because first of all we dont need raw extreme speed here we need safety pre handled and along with reconnect and fallback polling to http which would otherwise had increased the devlopement time by a lot, if the game was real time as in 1000s of inputs between 2 players in same room at the same time web socket would have worked great since we would wana avoid bloat coming with socketio)
- reactjs with vite (i used react cause it seemed like the most logical choice to build componenet based ui and most important reason is react is state based system with stateless componenets which is perfect for a card game since i can just set states and update them and rerender whatever i need to when they change which increases the performance )
<video src="https://youtu.be/BjLlIcESG3g" controls muted></video>
# features
- complete crazy eight gameplay 
- real time multiplayer 
- multiple game rooms 
- player turn management
- card Validation
- player reconnect
- win loss logic
- dockerized so you can run docker compose up and you can play it yourself

  
# todo
- polish the ui
- generate documentation
- clean up the code
- add ai player support
- room deletation when players quit mid game
- timer for automatic round end
