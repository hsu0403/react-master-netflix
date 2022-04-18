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
import { getTopRatedTv, getTvShows, IGetTvShowResult } from "../api";
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

const BigTv = styled(motion.div)`
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

function Tv() {
  width = useWindowWidth();
  const navigate = useNavigate();
  const { scrollY } = useViewportScroll();
  const setScrollY = useTransform(scrollY, (value) => value + 100);
  const bigAirMatch = useMatch("/tv/on_air/:tvId");
  const bigTopMatch = useMatch("/tv/top_rated/:tvId");
  const { data: onAirData, isLoading: onAirLoading } =
    useQuery<IGetTvShowResult>(["tv", "onAir"], getTvShows);
  const { data: topRatedData, isLoading: topRatedLoading } =
    useQuery<IGetTvShowResult>(["tv", "topRated"], getTopRatedTv);
  const [airIndex, setAirIndex] = useState(0);
  const [airBack, setAirBack] = useState(false);
  const [airLeaving, setAirLeaving] = useState(false);
  const [topIndex, setTopIndex] = useState(0);
  const [topBack, setTopBack] = useState(false);
  const [topLeaving, setTopLeaving] = useState(false);

  const onAirNext = () => {
    if (onAirData) {
      if (airLeaving) return;
      toggleAirLeaving();
      setAirBack(false);
      const totalMovies = onAirData.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setAirIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const onAirPrev = () => {
    if (onAirData) {
      if (airLeaving) return;
      toggleAirLeaving();
      setAirBack(true);
      const totalMovies = onAirData.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setAirIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };
  const toggleAirLeaving = () => {
    setAirLeaving((prev) => !prev);
  };

  const onTopNext = () => {
    if (topRatedData) {
      if (topLeaving) return;
      toggleTopLeaving();
      setTopBack(false);
      const totalMovies = topRatedData.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setTopIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const onTopPrev = () => {
    if (topRatedData) {
      if (topLeaving) return;
      toggleTopLeaving();
      setTopBack(true);
      const totalMovies = topRatedData.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      setTopIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
    }
  };
  const toggleTopLeaving = () => {
    setTopLeaving((prev) => !prev);
  };

  const onAirClicked = (tvId: number) => {
    navigate(`/tv/on_air/${tvId}`);
  };
  const onTopClicked = (tvId: number) => {
    navigate(`/tv/top_rated/${tvId}`);
  };
  const onOverlayClick = () => navigate(-1);

  const clickedAir =
    bigAirMatch?.params.tvId &&
    onAirData?.results.find((tv) => String(tv.id) === bigAirMatch.params.tvId);

  const clickedTop =
    bigTopMatch?.params.tvId &&
    topRatedData?.results.find(
      (tv) => String(tv.id) === bigTopMatch.params.tvId
    );
  const loading = onAirLoading || topRatedLoading;
  return (
    <Wrapper>
      {loading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            bgphoto={makeImagePath(onAirData?.results[0].backdrop_path || "")}
          >
            <Title>{onAirData?.results[0].name}</Title>
            <OverView>{onAirData?.results[0].overview}</OverView>
          </Banner>
          <SliderWrapper>
            <h2>On Air</h2>
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
                  onClick={onAirPrev}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 512"
                >
                  <path d="M192 448c-8.188 0-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25l160-160c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l137.4 137.4c12.5 12.5 12.5 32.75 0 45.25C208.4 444.9 200.2 448 192 448z" />
                </Button>
              </ButtonWrapper>
              <AnimatePresence
                custom={airBack}
                initial={false}
                onExitComplete={toggleAirLeaving}
              >
                <Row
                  variants={rowVariants}
                  custom={airBack}
                  initial="entry"
                  animate="center"
                  exit="exit"
                  key={`onAir${airIndex}`}
                  transition={{ type: "tween", duration: 0.5 }}
                >
                  {onAirData?.results
                    .slice(1)
                    .slice(offset * airIndex, offset * airIndex + offset)
                    .map((tv) => (
                      <Box
                        layoutId={`onAir${tv.id}`}
                        onClick={() => onAirClicked(tv.id)}
                        variants={boxVariants}
                        initial="normal"
                        whileHover="hover"
                        transition={{ type: "tween" }}
                        key={`onAir${tv.id}`}
                        bgphoto={makeImagePath(
                          tv.backdrop_path || tv.poster_path,
                          "w500"
                        )}
                      >
                        <Info variants={infoVariants} key={`onAir${tv.id}`}>
                          <h4>{tv.name}</h4>
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
                  onClick={onAirNext}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 512"
                >
                  <path d="M64 448c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L178.8 256L41.38 118.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160c12.5 12.5 12.5 32.75 0 45.25l-160 160C80.38 444.9 72.19 448 64 448z" />
                </Button>
              </ButtonWrapper>
            </Slider>
          </SliderWrapper>
          <SliderWrapper>
            <h2>Top Rated</h2>
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
                  onClick={onTopPrev}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 512"
                >
                  <path d="M192 448c-8.188 0-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25l160-160c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l137.4 137.4c12.5 12.5 12.5 32.75 0 45.25C208.4 444.9 200.2 448 192 448z" />
                </Button>
              </ButtonWrapper>
              <AnimatePresence
                custom={topBack}
                initial={false}
                onExitComplete={toggleTopLeaving}
              >
                <Row
                  variants={rowVariants}
                  custom={topBack}
                  initial="entry"
                  animate="center"
                  exit="exit"
                  key={`top${topIndex}`}
                  transition={{ type: "tween", duration: 0.5 }}
                >
                  {topRatedData?.results
                    .slice(1)
                    .slice(offset * topIndex, offset * topIndex + offset)
                    .map((tv) => (
                      <Box
                        layoutId={`top${tv.id}`}
                        onClick={() => onTopClicked(tv.id)}
                        variants={boxVariants}
                        initial="normal"
                        whileHover="hover"
                        transition={{ type: "tween" }}
                        key={`top${tv.id}`}
                        bgphoto={makeImagePath(
                          tv.backdrop_path || tv.poster_path,
                          "w500"
                        )}
                      >
                        <Info variants={infoVariants} key={`top${tv.id}`}>
                          <h4>{tv.name}</h4>
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
                  onClick={onTopNext}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 512"
                >
                  <path d="M64 448c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L178.8 256L41.38 118.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160c12.5 12.5 12.5 32.75 0 45.25l-160 160C80.38 444.9 72.19 448 64 448z" />
                </Button>
              </ButtonWrapper>
            </Slider>
          </SliderWrapper>
          <AnimatePresence>
            {bigAirMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <BigTv
                  style={{ top: setScrollY }}
                  layoutId={`onAir${bigAirMatch.params.tvId}`}
                >
                  {clickedAir && (
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
                            clickedAir.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      ></BigCover>
                      <BigTitle>{clickedAir.name}</BigTitle>
                      <BigInfoWrapper>
                        <BigOverView>
                          {clickedAir.overview
                            ? clickedAir.overview
                            : "sorry, no data."}
                        </BigOverView>
                        <BigInfo>
                          <div>
                            <BigInfoCategory>Country:</BigInfoCategory>{" "}
                            {clickedAir.origin_country}
                          </div>
                          <div>
                            <BigInfoCategory>First-Air-Date:</BigInfoCategory>{" "}
                            {clickedAir.first_air_date}
                          </div>
                          <div>
                            <BigInfoCategory>Rating:</BigInfoCategory>{" "}
                            {clickedAir.vote_average}
                          </div>
                        </BigInfo>
                      </BigInfoWrapper>
                    </>
                  )}
                </BigTv>
              </>
            ) : null}
            {bigTopMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <BigTv
                  style={{ top: setScrollY }}
                  layoutId={`top${bigTopMatch.params.tvId}`}
                >
                  {clickedTop && (
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
                            clickedTop.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      ></BigCover>
                      <BigTitle>{clickedTop.name}</BigTitle>
                      <BigInfoWrapper>
                        <BigOverView>
                          {clickedTop.overview
                            ? clickedTop.overview
                            : "sorry, no data."}
                        </BigOverView>
                        <BigInfo>
                          <div>
                            <BigInfoCategory>Country:</BigInfoCategory>{" "}
                            {clickedTop.origin_country}
                          </div>
                          <div>
                            <BigInfoCategory>First-Air-Date:</BigInfoCategory>{" "}
                            {clickedTop.first_air_date}
                          </div>
                          <div>
                            <BigInfoCategory>Rating:</BigInfoCategory>{" "}
                            {clickedTop.vote_average}
                          </div>
                        </BigInfo>
                      </BigInfoWrapper>
                    </>
                  )}
                </BigTv>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Tv;
