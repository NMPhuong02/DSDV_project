import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from "../../assets/css/styles.module.css";
import images1 from "../../assets/images/Poster_movies/Django(2012).jpg";
import images2 from "../../assets/images/Poster_movies/The Wolf of Wall Street.jpg";
import images3 from "../../assets/images/Poster_movies/Interstellar(2014).jpg";
import images4 from "../../assets/images/Poster_movies/InsideOut(2015).jpg";
import images5 from "../../assets/images/Poster_movies/YourName.jpg";
import images6 from "../../assets/images/Poster_movies/TheGood(1996).jpg";

const Home = () => {
  const sliderSettings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 10,
    centerMode: true,
    focusOnSelect: true,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: false,
          focusOnSelect: false,
        },
      },
    ],
  };

  return (
    <div>
      <h1 className={styles.introduction}>Welcome!</h1>
      <br></br>
      <p className={styles.text}>Top 5 Most Popular Movies</p>
      <br></br>
      <div className={styles.imageContainer}>
        <Slider {...sliderSettings}>
          <img src={images1} alt="Django" className={styles.image1} />
          <img
            src={images2}
            alt="The Wolf of Wall Street"
            className={styles.image2}
          />
          <img src={images3} alt="Interstellar" className={styles.image3} />
          <img src={images4} alt="Inside Out" className={styles.image4} />
          <img src={images5} alt="Your Name" className={styles.image5} />
          <img src={images6} alt="The Good" className={styles.image6} />
        </Slider>
      </div>
    </div>
  );
};

export default Home;
