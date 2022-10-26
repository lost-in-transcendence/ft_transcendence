import './Hero.css'

export default function Hero ()
{
    return (
        <div className="hero_wrap">
            <div className="hero_title">
                Game Of the Month...
            </div>
            <div className="gotm_wrap">
                <div className="featured_game_description">
                    Pong was made in 1970 by some old fuck, the end.
                </div>
                <div className="featured_game_wrap">
                    <h2>PONG</h2>
                    <div className="featured_game">

                        <img src="https://global-img.gamergen.com/pong_0900808237.jpg" width="250px" height="200px" />
                        <span className="gradient"></span>
                        <span className="gradient2"></span>
   
                    </div>
                </div>
                <div className="featured_game_reviews">
                    4 outta five.
                </div>
            </div>
            <div className="featured_game_button">
                <button>PLAY NOW</button>
            </div>
        </div>
    )
}