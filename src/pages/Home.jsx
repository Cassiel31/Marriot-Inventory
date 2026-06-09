import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">

      <div className="home-overlay">

        <p className="home-tag">
          Goa Marriott
        </p>

        <h1 className="home-title">
          IT Inventory
        </h1>

        <div className="home-buttons">

          <Link to="/login">
            <button className="primary-button">
              LOG IN
            </button>
          </Link>

          <Link to="/signup">
            <button className="secondary-button">
              SIGN UP
            </button>
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Home;