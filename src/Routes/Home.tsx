import {
  AnimatePresence,
  motion,
  useTransform,
  useViewportScroll,
} from "framer-motion";
import { useState } from "react";
import { useQuery } from "react-query";
import { useMatch, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getMovies, getPopularMovies, IGetMoviesResult } from "../api";
import useWindowWidth from "../useWindowWidth";
import { makeImagePath } from "../utilities";

const Wrapper = styled.div`
  background-color: black;
  height: 150vh;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{ bgphoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(
      rgba(0, 0, 0, 0.6),
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0.6)
    ),
    url(${(props) => props.bgphoto});
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
`;

const Title = styled.h2`
  font-size: 58px;
  margin-bottom: 20px;
`;

const OverView = styled.p`
  font-size: 20px;
  width: 50%;
`;

const SliderWrapper = styled.div`
  position: relative;
  top: -100px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 50px;
  h2 {
    font-size: 26px;
    font-weight: bold;
    position: absolute;
    top: -40px;
    left: 20px;
    cursor: default;
    user-select: none;
  }
`;

const Slider = styled(motion.div)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  &:hover {
    svg {
      opacity: 0.8;
    }
  }
`;

const ButtonWrapper = styled(motion.div)`
  width: 20px;
  height: 180px;
  display: flex;
  align-items: center;
  z-index: 1;
`;

const Button = styled(motion.svg)`
  z-index: 2;
  opacity: 0;
  height: 25px;
  width: 25px;
  cursor: pointer;
`;

const Row = styled(motion.div)`
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
  padding: 0 20px;
`;

const Box = styled(motion.div)<{ bgphoto: string }>`
  background-image: url(${(props) => props.bgphoto});
  font-size: 50px;
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
  width: 100%;
  height: 180px;
  //padding-top: 66.64%;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
  &:hover {
    div {
      display: block;
    }
  }
`;

const Info = styled(motion.div)`
  margin-top: 180px;
  display: none;
  opacity: 0;
  padding: 10px;
  width: 100%;
  background-color: ${(props) => props.theme.black.lighter};
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  z-index: 3;
`;

const BigMovie = styled(motion.div)`
  z-index: 4;
  position: absolute;
  width: 800px;
  height: 80vh;
  right: 0;
  left: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
`;

const CloseButton = styled(motion.svg)`
  top: 10px;
  right: 10px;
  position: absolute;
  z-index: 5;
  height: 30px;
  width: 30px;
  cursor: pointer;
`;

const BigCover = styled.div`
  width: 100%;
  height: 0;
  padding-top: 66.64%;
  background-position: center center;
  background-size: cover;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 36px;
  position: relative;
  top: -80px;
`;

const BigInfoWrapper = styled.div`
  display: flex;
  position: relative;
  top: -80px;
  justify-content: space-between;
`;

const BigInfo = styled.div`
  padding: 20px;
  margin-right: 20px;
`;

const BigOverView = styled.p`
  padding: 20px;
  width: 60%;
  color: ${(props) => props.theme.white.lighter};
`;

const BigInfoCategory = styled.span`
  color: #777;
  cursor: default;
  user-select: none;
`;

const rowVariants = {
  entry: (back: boolean) => ({
    x: back ? -width + 5 : width - 5,
  }),
  center: { x: 0 },
  exit: (back: boolean) => ({
    x: back ? width - 5 : -width + 5,
  }),
};

const buttonWrapperVarinats = {
  inactive: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  active: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
};

const buttonVariants = {
  inactive: {
    fill: "rgba(255, 255, 255, 1)",
  },
  active: {
    fill: "rgba(243, 56, 56, 1)",
    transition: {
      duration: 1,
    },
  },
};

const boxVariants = {
  hover: {
    scale: 1.3,
    y: -50,
    transition: {
      delay: 0.5,
      duration: 0.2,
    },
  },
  normal: {
    scale: 1,
  },
};

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.4,
      duration: 0.2,
    },
  },
};

const offset = 6;
let width = 0;

function Home() {
  const navigate = useNavigate();
  const bigMovieMatch = useMatch("/movies/:movieId");
  const popBigMovieMatch = useMatch("/popular_movies/:movieId");
  const { scrollY } = useViewportScroll();
  const setScrollY = useTransform(scrollY, (value) => value + 100);
  const { data: nowData, isLoading: nowLoading } = useQuery<IGetMoviesResult>(
    ["movies", "nowPlaying"],
    getMovies
  );
  const { data: popularData, isLoading: popularLoading } =
    useQuery<IGetMoviesResult>(["movies", "popular"], getPopularMovies);
  const [index, setIndex] = useState(0);
  const [back, setBack] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [popularIndex, setPopularIndex] = useState(0);
  const [popularBack, setPopularBack] = useState(false);
  const [popularLeaving, setPopularLeaving] = useState(false);

  const onNext = () => {
    if (nowData) {
      if (leaving) return;
      toggleLeaving();
      setBack(false);
      const totalMovies = nowData.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const onPrev = () => {
    if (nowData) {
      if (leaving) return;
      toggleLeaving();
      setBack(true);
      const totalMovies = nowData.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };
  const toggleLeaving = () => {
    setLeaving((prev) => !prev);
  };

  const onPopularNext = () => {
    if (popularData) {
      if (popularLeaving) return;
      togglePopularLeaving();
      setPopularBack(false);
      const totalMovies = popularData.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setPopularIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const onPopularPrev = () => {
    if (popularData) {
      if (popularLeaving) return;
      togglePopularLeaving();
      setPopularBack(true);
      const totalMovies = popularData.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setPopularIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };
  const togglePopularLeaving = () => {
    setPopularLeaving((prev) => !prev);
  };

  width = useWindowWidth();

  const onBoxClicked = (movieId: number) => {
    navigate(`/movies/${movieId}`);
  };

  const onPopularClicked = (movieId: number) => {
    navigate(`/popular_movies/${movieId}`);
  };

  const onOverlayClick = () => navigate(-1);
  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    nowData?.results.find(
      (movie) => String(movie.id) === bigMovieMatch.params.movieId
    );
  const clickedPopMovie =
    popBigMovieMatch?.params.movieId &&
    popularData?.results.find(
      (movie) => String(movie.id) === popBigMovieMatch.params.movieId
    );
  const loading = nowLoading || popularLoading;
  return (
    <Wrapper>
      {loading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            bgphoto={makeImagePath(nowData?.results[0].backdrop_path || "")}
          >
            <Title>{nowData?.results[0].title}</Title>
            <OverView>{nowData?.results[0].overview}</OverView>
          </Banner>
          <SliderWrapper>
            <h2>Now Playing</h2>
            <Slider>
              <ButtonWrapper
                variants={buttonWrapperVarinats}
                initial="inactive"
                whileHover="active"
              >
                <Button
                  variants={buttonVariants}
                  initial="inactive"
                  whileHover="active"
                  stroke="white"
                  strokeWidth="2"
                  onClick={onPrev}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 512"
                >
                  <path d="M192 448c-8.188 0-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25l160-160c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l137.4 137.4c12.5 12.5 12.5 32.75 0 45.25C208.4 444.9 200.2 448 192 448z" />
                </Button>
              </ButtonWrapper>

              <AnimatePresence
                custom={back}
                initial={false}
                onExitComplete={toggleLeaving}
              >
                <Row
                  variants={rowVariants}
                  custom={back}
                  initial="entry"
                  animate="center"
                  exit="exit"
                  key={`now${index}`}
                  transition={{ type: "tween", duration: 0.5 }}
                >
                  {nowData?.results
                    .slice(1)
                    .slice(offset * index, offset * index + offset)
                    .map((movie) => (
                      <Box
                        layoutId={`now${movie.id}`}
                        onClick={() => onBoxClicked(movie.id)}
                        variants={boxVariants}
                        whileHover="hover"
                        initial="normal"
                        transition={{
                          type: "tween",
                        }}
                        key={`now${movie.id}`}
                        bgphoto={makeImagePath(
                          movie.backdrop_path || movie.poster_path,
                          "w500"
                        )}
                      >
                        <Info key={`now${movie.id}`} variants={infoVariants}>
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
              <ButtonWrapper
                variants={buttonWrapperVarinats}
                initial="inactive"
                whileHover="active"
              >
                <Button
                  variants={buttonVariants}
                  initial="inactive"
                  whileHover="active"
                  stroke="white"
                  strokeWidth="2"
                  onClick={onNext}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 512"
                >
                  <path d="M64 448c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L178.8 256L41.38 118.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160c12.5 12.5 12.5 32.75 0 45.25l-160 160C80.38 444.9 72.19 448 64 448z" />
                </Button>
              </ButtonWrapper>
            </Slider>
          </SliderWrapper>
          <SliderWrapper>
            <h2>Popular Movies</h2>
            <Slider>
              <ButtonWrapper
                variants={buttonWrapperVarinats}
                initial="inactive"
                whileHover="active"
              >
                <Button
                  variants={buttonVariants}
                  initial="inactive"
                  whileHover="active"
                  stroke="white"
                  strokeWidth="2"
                  onClick={onPopularPrev}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 512"
                >
                  <path d="M192 448c-8.188 0-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25l160-160c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l137.4 137.4c12.5 12.5 12.5 32.75 0 45.25C208.4 444.9 200.2 448 192 448z" />
                </Button>
              </ButtonWrapper>

              <AnimatePresence
                custom={popularBack}
                initial={false}
                onExitComplete={togglePopularLeaving}
              >
                <Row
                  variants={rowVariants}
                  custom={popularBack}
                  initial="entry"
                  animate="center"
                  exit="exit"
                  key={`popular${popularIndex}`}
                  transition={{ type: "tween", duration: 0.5 }}
                >
                  {popularData?.results
                    .slice(2)
                    .slice(
                      offset * popularIndex,
                      offset * popularIndex + offset
                    )
                    .map((movie) => (
                      <Box
                        layoutId={`popular${movie.id}`}
                        onClick={() => onPopularClicked(movie.id)}
                        variants={boxVariants}
                        whileHover="hover"
                        initial="normal"
                        transition={{
                          type: "tween",
                        }}
                        key={`popular${movie.id}`}
                        bgphoto={makeImagePath(
                          movie.backdrop_path || movie.poster_path,
                          "w500"
                        )}
                      >
                        <Info
                          key={`popular${movie.id}`}
                          variants={infoVariants}
                        >
                          <h4>{movie.title}</h4>
                        </Info>
                      </Box>
                    ))}
                </Row>
              </AnimatePresence>
              <ButtonWrapper
                variants={buttonWrapperVarinats}
                initial="inactive"
                whileHover="active"
              >
                <Button
                  variants={buttonVariants}
                  initial="inactive"
                  whileHover="active"
                  stroke="white"
                  strokeWidth="2"
                  onClick={onPopularNext}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 512"
                >
                  <path d="M64 448c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L178.8 256L41.38 118.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160c12.5 12.5 12.5 32.75 0 45.25l-160 160C80.38 444.9 72.19 448 64 448z" />
                </Button>
              </ButtonWrapper>
            </Slider>
          </SliderWrapper>
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <BigMovie
                  style={{ top: setScrollY }}
                  layoutId={`now${bigMovieMatch.params.movieId}`}
                >
                  {clickedMovie && (
                    <>
                      <CloseButton
                        variants={buttonVariants}
                        initial="inactive"
                        whileHover="active"
                        onClick={onOverlayClick}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256zM175 208.1L222.1 255.1L175 303C165.7 312.4 165.7 327.6 175 336.1C184.4 346.3 199.6 346.3 208.1 336.1L255.1 289.9L303 336.1C312.4 346.3 327.6 346.3 336.1 336.1C346.3 327.6 346.3 312.4 336.1 303L289.9 255.1L336.1 208.1C346.3 199.6 346.3 184.4 336.1 175C327.6 165.7 312.4 165.7 303 175L255.1 222.1L208.1 175C199.6 165.7 184.4 165.7 175 175C165.7 184.4 165.7 199.6 175 208.1V208.1z" />
                      </CloseButton>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent), url(${makeImagePath(
                            clickedMovie.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      ></BigCover>
                      <BigTitle>{clickedMovie.title}</BigTitle>
                      <BigInfoWrapper>
                        <BigOverView>{clickedMovie.overview}</BigOverView>
                        <BigInfo>
                          <div>
                            <BigInfoCategory>Adult:</BigInfoCategory>{" "}
                            {clickedMovie.adult ? "R-rated" : "G-rated"}
                          </div>
                          <div>
                            <BigInfoCategory>Opening Date:</BigInfoCategory>{" "}
                            {clickedMovie.release_date}
                          </div>
                          <div>
                            <BigInfoCategory>Rating:</BigInfoCategory>{" "}
                            {clickedMovie.vote_average}
                          </div>
                        </BigInfo>
                      </BigInfoWrapper>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
            {popBigMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <BigMovie
                  style={{ top: setScrollY }}
                  layoutId={`popular${popBigMovieMatch.params.movieId}`}
                >
                  {clickedPopMovie && (
                    <>
                      <CloseButton
                        variants={buttonVariants}
                        initial="inactive"
                        whileHover="active"
                        onClick={onOverlayClick}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d="M0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256zM175 208.1L222.1 255.1L175 303C165.7 312.4 165.7 327.6 175 336.1C184.4 346.3 199.6 346.3 208.1 336.1L255.1 289.9L303 336.1C312.4 346.3 327.6 346.3 336.1 336.1C346.3 327.6 346.3 312.4 336.1 303L289.9 255.1L336.1 208.1C346.3 199.6 346.3 184.4 336.1 175C327.6 165.7 312.4 165.7 303 175L255.1 222.1L208.1 175C199.6 165.7 184.4 165.7 175 175C165.7 184.4 165.7 199.6 175 208.1V208.1z" />
                      </CloseButton>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent), url(${makeImagePath(
                            clickedPopMovie.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      ></BigCover>
                      <BigTitle>{clickedPopMovie.title}</BigTitle>
                      <BigInfoWrapper>
                        <BigOverView>{clickedPopMovie.overview}</BigOverView>
                        <BigInfo>
                          <div>
                            <BigInfoCategory>Adult:</BigInfoCategory>{" "}
                            {clickedPopMovie.adult ? "R-rated" : "G-rated"}
                          </div>
                          <div>
                            <BigInfoCategory>Opening Date:</BigInfoCategory>{" "}
                            {clickedPopMovie.release_date}
                          </div>
                          <div>
                            <BigInfoCategory>Rating:</BigInfoCategory>{" "}
                            {clickedPopMovie.vote_average}
                          </div>
                        </BigInfo>
                      </BigInfoWrapper>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
