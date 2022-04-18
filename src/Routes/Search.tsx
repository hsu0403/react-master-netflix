import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  getSearch,
  getSimilarMovies,
  getSimilarTvShows,
  IGetMoviesResult,
  IGetTvShowResult,
} from "../api";
import { makeImagePath } from "../utilities";

const Wrapper = styled.div`
  background-color: black;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const HeaderBox = styled.div`
  width: 100%;
  height: 100px;
`;

const Subject = styled.h2`
  font-weight: bold;
  font-size: 26px;
  cursor: default;
  user-select: none;
`;

const Title = styled.h4``;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BoxWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  grid-gap: 15px;
  grid-row-gap: 50px;
  margin-bottom: 100px;
`;

const Box = styled.div<{ bgphoto: string }>`
  width: 100%;
  height: 0;
  padding-top: 66.67%;
  background-image: url(${(props) => props.bgphoto});
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
`;

interface IResults {
  id: number;
  name: string;
  title: string;
  media_type: string;
  release_date: string;
  vote_average: number;
  overview: string;
  original_language: string;
  poster_path: string;
  backdrop_path: string;
}

interface ISearch {
  results: IResults[];
  total_pages: number;
}

function Search() {
  const location = useLocation();
  const keyword = new URLSearchParams(location.search);
  let search = keyword.get("keyword");
  const [searchLoading, setSearchLoading] = useState(true);
  const [searchData, setSearchData] = useState<ISearch>();
  const [isFetching, setFetching] = useState(false);
  const [similarMovieData, setSimilarMovieData] = useState<IGetMoviesResult>();
  const [similarTvData, setSimilarTvData] = useState<IGetTvShowResult>();
  const [similarLoading, setSimilarLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const json = await getSearch(search || "");
      setSearchData(json);
      setSearchLoading(false);
      setFetching((prev) => !prev);
    })();
  }, [search]);

  useEffect(() => {
    if (isFetching) {
      if (searchData?.results[0].media_type === "movie") {
        (async () => {
          const json = await getSimilarMovies(searchData.results[0].id);
          setSimilarMovieData(json);
          setSimilarLoading(false);
          setFetching((prev) => !prev);
        })();
      }
      if (searchData?.results[0].media_type === "tv") {
        (async () => {
          const json = await getSimilarTvShows(searchData.results[0].id);
          setSimilarTvData(json);
          setSimilarLoading(false);
          setFetching((prev) => !prev);
        })();
      }
    }
  }, [isFetching, searchData?.results]);
  const loading = searchLoading || similarLoading;
  return (
    <Wrapper>
      <HeaderBox />
      {loading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Subject>Search</Subject>
          <BoxWrapper>
            {searchData?.results.map((data) => (
              <div>
                {data.media_type === "movie" ? (
                  <Box
                    key={data.id}
                    bgphoto={makeImagePath(
                      data.backdrop_path || data.poster_path,
                      "w500"
                    )}
                  >
                    <Title>{data.title}</Title>
                  </Box>
                ) : (
                  <Box
                    key={data.id}
                    bgphoto={makeImagePath(
                      data.backdrop_path || data.poster_path,
                      "w500"
                    )}
                  >
                    <Title>{data.name}</Title>
                  </Box>
                )}
              </div>
            ))}
          </BoxWrapper>
          <Subject>Similar</Subject>
          <BoxWrapper>
            {similarMovieData
              ? similarMovieData.results.map((data) => (
                  <div>
                    <Box
                      key={data.id}
                      bgphoto={makeImagePath(
                        data.backdrop_path || data.poster_path,
                        "w500"
                      )}
                    >
                      <Title>{data.title}</Title>
                    </Box>
                  </div>
                ))
              : similarTvData
              ? similarTvData.results.map((data) => (
                  <div>
                    <Box
                      key={data.id}
                      bgphoto={makeImagePath(
                        data.backdrop_path || data.poster_path,
                        "w500"
                      )}
                    >
                      <Title>{data.name}</Title>
                    </Box>
                  </div>
                ))
              : null}
          </BoxWrapper>
        </>
      )}
    </Wrapper>
  );
}

export default Search;
