import { useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { GameStatus } from "../../dto/game.dto";
import { Canvas } from "../Canvas/canvas";
import GameSocketContext from "../Game/Context/game-socket-context";
import SocketContext from "../Socket/socket-context";

const gameWidth = 800;
const gameHeight = 600;
const paddleSize = 100;
const ballSize = 25;

const themes = {
  classic: {ballColor: 'white', paddleColor: 'white', background: 'bg-black' },
  camouflage: {ballColor: 'green', paddleColor: 'green', background: 'bg-green-600'},
  rolandGarros: {ballColor: 'yellow', paddleColor: 'white', background: 'bg-rolandGarros bg-cover bg-no-repeat'},
};

type GameItems = {
  paddle1Pos: number;
  paddle2Pos: number;
  ballPos: { x: number; y: number };
  player1Score: number;
  player2Score: number;
};

enum PaddleDirection {
  UP = -1,
  STOP = 0,
  DOWN = 1,
}

function DisplayTimer(props: {
  timer: any;
  years: boolean;
  hours: boolean;
  minutes: boolean;
  seconds: boolean;
}) {
  const { timer } = props;
  let years, hours, minutes, seconds;
  let timerstr = "";
  if (props.years === true) {
    years = Math.floor(timer / (60 * 60 * 24));
    timerstr += years;
  }
  if (props.hours === true) {
    (hours = Math.floor((timer / (60 * 60)) % 24)),
      (timerstr += hours < 10 ? `0${hours}` : hours);
  }
  if (props.minutes === true) {
    minutes = Math.floor((timer / 60) % 60);
    timerstr += minutes < 10 ? `0${minutes}` : minutes;
  }
  if (props.seconds === true) {
    seconds = Math.floor(timer % 60);
    timerstr += ":" + (seconds < 10 ? `0${seconds}` : seconds);
  }

  return <div className="flex mx-auto bg-gray-700 text-gray-400 text-xl">{timerstr}</div>;
}

export function Pong(props: { goBack: any, asSpectator: boolean, gameInfos: {theme: string, user1Name: string, user2Name: string, launchTime: number} | undefined}) {
  const { goBack, asSpectator, gameInfos} = props;
  const { socket } = useContext(GameSocketContext).GameSocketState;
  const masterSocket = useContext(SocketContext).SocketState.socket;
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [endScreen, setEndScreen] = useState({
    winner: "",
    loser: "",
    draw: false,
    reason: "",
  });
  const [status, setStatus] = useState("playing");
  const [error, setError] = useState<string | null>(null);
  const [gameItems, setGameItems] = useState<GameItems>({
    paddle1Pos: Math.round(gameHeight / 2 - paddleSize / 2),
    paddle2Pos: Math.round(gameHeight / 2 - paddleSize / 2),
    ballPos: {
      x: gameWidth / 2,
      y: gameHeight / 2,
    },
    player1Score: 0,
    player2Score: 0,
  });

  const [timer, setTimer] = useState(0);

  const [theme, setTheme] = useState<{ballColor: string, paddleColor: string, background: string}>(themes.classic);
  useEffect( () => {
    switch (props.gameInfos?.theme)
    {
      case 'camouflage':
        setTheme(themes.camouflage);
        break;
      case 'rolandGarros':
        setTheme(themes.rolandGarros);
        break;
      default:
        setTheme(themes.classic);
    }
    if (gameInfos?.launchTime)
    {
      setTimer(Math.round((Date.now() - gameInfos.launchTime) / 1000));
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (showEndScreen === false) {
        setTimer((prev) => {
          return prev + 1;
        });
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [showEndScreen]);

  useEffect(() => {
    socket?.on("disconnected", () => {
      setStatus("playerDisconnected");
      setError("Someone disconnected");
    });
    socket?.on("renderFrame", (payload: any) => {
      setGameItems({
        ...gameItems,
        paddle1Pos: payload.paddle1Pos,
        paddle2Pos: payload.paddle2Pos,
        ballPos: payload.ballPos,
        player1Score: payload.player1Score,
        player2Score: payload.player2Score,
      });
    });
    socket?.on("endGame", (payload: any) => {
      const { winner, loser, draw, reason } = payload;
      setEndScreen({ ...endScreen, winner, loser, draw, reason });
      setShowEndScreen(true);
      masterSocket?.emit("changeGameStatus", { gameStatus: GameStatus.NONE });
    });

    return () => {
      socket?.off("disconnected");
      socket?.off("renderFrame");
      socket?.off("endGame");
    };
  }, []);

  function drawGame(ctx: any) {
    const heightRatio = ctx.canvas.height / 600;
    const widthRatio = ctx.canvas.width / 800;
    

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // background
    // ctx.fillStyle = "#242424";
    // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // outline
    // ctx.strokeStyle = "#fff";
    // ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // middle line
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([10]);
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width / 2, 0);
    ctx.lineTo(ctx.canvas.width / 2, ctx.canvas.height);
    ctx.stroke();

    // score
    // ctx.font = "30px Orbitron";
    // ctx.fillStyle = theme?.paddleColor;
    // ctx.fillText(gameItems.player1Score, ctx.canvas.width / 2 / 2, 100);
    // ctx.fillText(gameItems.player2Score, (ctx.canvas.width / 2) * 1.5, 100);

    // display names
    // ctx.fillText(gameInfos?.user1Name, ctx.canvas.width / 2 / 2 - 30, 40);
    // ctx.fillText(gameInfos?.user2Name, (ctx.canvas.width / 2) * 1.5 - 30, 40);

    // paddles
    ctx.fillStyle = theme?.paddleColor;
    ctx.fillRect(
      1,
      gameItems.paddle1Pos * heightRatio,
      10 * widthRatio,
      paddleSize * heightRatio
    );
    ctx.fillRect(
      ctx.canvas.width - 10 * widthRatio,
      gameItems.paddle2Pos * heightRatio,
      10 * widthRatio,
      paddleSize * heightRatio
    );

    // ball
    ctx.fillStyle = theme?.ballColor;
    ctx.beginPath();
    ctx.arc(
      gameItems.ballPos.x * widthRatio,
      gameItems.ballPos.y * heightRatio,
      (ballSize / 2) * ((widthRatio + heightRatio) / 2),
      0,
      2 * Math.PI
    );
    ctx.fill();
  }

  function handleKeyUp(e: any) {
    if (asSpectator === true) return;
    var key = e.key;
    if (key === "w") {
      socket?.emit("paddleMove", { direction: PaddleDirection.STOP });
    }
    if (key === "s") {
      socket?.emit("paddleMove", { direction: PaddleDirection.STOP });
    }
  }

  function handleKeyDown(e: any) {
    if (asSpectator === true) return;
    var key = e.key;
    if (key === "w") {
      socket?.emit("paddleMove", { direction: PaddleDirection.UP });
    }
    if (key === "s") {
      socket?.emit("paddleMove", { direction: PaddleDirection.DOWN });
    }
  }

  return (
    <div className="flex flex-col items-center w-full">

      <div className="flex flex-row bg-gray-700 my-2 w-full h-[20%]">

        <div className="flex flex-col h-full w-[30%] text-xl text-gray-400 border-gray-600 border-2 justify-center">
          <p className="truncate text-center border-b border-gray-600">{gameInfos?.user1Name}</p>
        </div>
        <div className="flex flex-col h-full w-[10%] text-xl text-gray-400 border-gray-600 border-2 justify-center">
          <p className="flex mx-auto">{gameItems.player1Score}</p>
        </div>

        <DisplayTimer timer={timer}
        years={false}
        hours={false}
        minutes={true}
        seconds={true}
        />

        <div className="flex flex-col h-full w-[10%] text-xl text-gray-400 border-gray-600 border-2 justify-center">
          <p className="flex mx-auto">{gameItems.player2Score}</p>
        </div>
        <div className="flex flex-col h-full w-[30%] text-xl text-gray-400 border-gray-600 border-2 justify-center">
          <p className="truncate text-center border-b border-gray-600">{gameInfos?.user2Name}</p>
        </div>

      </div> 


      <div className={theme? theme.background + ' mx-auto relative': 'mx-auto relative'}>
        <Canvas
        onKeyDown={(e: any) => handleKeyDown(e)}
        onKeyUp={(e: any) => handleKeyUp(e)}
        tabIndex={0}
        draw={drawGame}
        />
      {
        showEndScreen ? 
        <EndScreen
        winner={endScreen.winner}
        loser={endScreen.loser}
        draw={endScreen.draw}
        reason={endScreen.reason}
        />
        :
        <>
      </>
      }
      </div>
      <button className="flex flex-row gap-4 items-center mt-10 mx-auto h-12 w-auto justify-items-center
						text-xl text-gray-400 cursor-pointer rounded bg-gray-600
						hover:bg-gray-500 hover:text-white hover:shadow-gray-900 hover:shadow-sm
						focus:bg-gray-500 focus:text-white focus:shadow-gray-900 focus:shadow-sm"
            onClick={goBack}>Go Back</button>
    </div>
  );
}

export function EndScreen(props: {
  winner: string;
  loser: string;
  draw: boolean;
  reason: string;
}) {
  const { winner, loser, draw, reason } = props;
  const ref: any = useRef(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    setWidth(ref.current.offsetWidth);
    setHeight(ref.current.offsetHeight);
  }, []);

  let title, content;
  if (draw) {
    title = "Draw";
    content = "What a game!";
  } else {
    title = `${winner.length > 15? winner.slice(0,15) + '...' : winner} wins!`;
    content = `${loser.length > 15 ? loser.slice(0,15) + '...': loser} could have done better`;
  }

  return (
    <div className="absolute w-full h-full top-0 left-0" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
      <div ref={ref} className="absolute" style={{top: `calc(50% - ${height/2}px)`, left:`calc(50% - ${width/2}px)`}} >
        <div className="flex flex-col bg-gray-700 w-auto">
          <h2 className="flex text-xl text-gray-400 mx-auto">{title}</h2>
          {
            reason ?
            <p className="flex text-xl text-gray-400 mx-auto">{reason}</p>
            :
            <p className="flex text-xl text-gray-400 mx-auto">{content}</p>
          }
        </div>
      </div>
    </div>
  );
}
