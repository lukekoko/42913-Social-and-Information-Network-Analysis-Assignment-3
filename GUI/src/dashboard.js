import React from "react";
import './App.css';
import axios from "axios";
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import Loader from "react-loader-spinner";

const API_URL_MOVIEDB = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.REACT_APP_MOVIEDB_API}&query=`

Modal.setAppElement('#root')

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: '50%',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};

export default function Dashboard() {
    let [popMovies, setPopMovies] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [loadingRec, setLoadingRec] = React.useState(true);
    const [modalIsOpen, setIsOpen] = React.useState(false);
    const [modalData, setModalData] = React.useState({ title: "" });
    const [recData, setRecData] = React.useState([]);

    function openModal(data) {
        setLoadingRec(true);
        getRecommendation(data.title);
        setModalData(data);
        setIsOpen(true);
    }
    function afterOpenModal() {
        // references are now sync'd and can be accessed.
    }

    function closeModal() {
        setIsOpen(false);
    }

    const getRecommendation = async (movie) => {
        const result = await axios.get("http://127.0.0.1:8000/recommend/" + movie);
        let tempArr = result.data.recommendations
        for (const i of tempArr) {
            let searchTitle = i.title.replace(/(\(.*\))/g, "").replace(", The", "").trim();
            const res = await axios.get(API_URL_MOVIEDB + searchTitle);
            i.poster = res.data.results[0].poster_path;
            i.overview = res.data.results[0].overview;
            i.release_date = res.data.results[0].release_date;
        }
        await setRecData(tempArr);
        setLoadingRec(false);
    }

    React.useEffect(() => {
        const fetchPopularMovies = async () => {
            setLoading(true);
            const result = await axios.get("http://127.0.0.1:8000/movies/stat");
            let tempArr = result.data.movies;
            for (const movie of tempArr) {
                try {
                    let searchTitle = movie.title.replace(/(\(.*\))/g, "").replace(", The", "").trim();
                    // console.log(searchTitle);
                    const result = await axios.get(API_URL_MOVIEDB + searchTitle);
                    // console.log(result);
                    movie.poster = result.data.results[0].poster_path;
                    movie.overview = result.data.results[0].overview;
                    movie.release_date = result.data.results[0].release_date;
                } catch (err) {
                    console.log(err);
                    movie.poster = "/h5J4W4veyxMXDMjeNxZI46TsHOb.jpg";
                }
            }
            setPopMovies(tempArr);
            setLoading(false);
        }
        fetchPopularMovies();
    }, []);


    return (
        <div>
            <section class="py-8 px-4">
                <div class="flex flex-wrap -mx-4 -mb-8">
                    {loading &&
                        <div class="justify-center mx-auto content-center">
                            <Loader
                                type="TailSpin"
                                color="#00BFFF"
                                height={100}
                                width={100}
                                timeout={3000} //3 secs
                            />
                        </div>
                    }
                    {!loading && popMovies.map((listValue, index) => {
                        return (
                            <div class="md:w-1/4 px-4 mb-8" key={index}>
                                <img key={index} class="rounded shadow" src={"https://image.tmdb.org/t/p/w500" + listValue.poster} alt="" onClick={() => openModal(listValue)} />
                                <h1 class="font-sans text-xl">{listValue.title}</h1>
                            </div>
                        );
                    })}
                </div>
            </section>

            <Modal
                isOpen={modalIsOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                contentLabel="Example Modal"
                style={customStyles}
            >
                <div class="py-5 px-5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" onClick={closeModal}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <img class="rounded shadow-md mx-auto h-1/4 w-80" src={"https://image.tmdb.org/t/p/w500" + modalData.poster} alt="" />
                    <p class="text-2xl">{modalData.title.replace(/(\(.*\))/g, "").replace(", The", "").trim()}</p>
                    <p class="text-2xl">Release: {modalData.release_date}</p>
                    <p class="text-xl">Synopsis: {modalData.overview}</p>
                    <section class="py-8 px-4">
                        <p class="text-2xl">Similar movies</p>
                        <div class="flex flex-wrap -mx-4 -mb-8">
                            {loadingRec &&
                                <div class="justify-center mx-auto content-center">
                                    <Loader
                                        type="TailSpin"
                                        color="#00BFFF"
                                        height={100}
                                        width={100}
                                        timeout={3000} //3 secs
                                    />
                                </div>
                            }

                            {!loadingRec && recData.map((listValue, index) => {
                                return (
                                    <div class="md:w-1/5 px-4 mb-8" key={index}>
                                        <img key={index} class="rounded shadow-md object-contain" src={"https://image.tmdb.org/t/p/w500" + listValue.poster} alt="" onClick={() => openModal(listValue)} />
                                        <h1 class="font-sans ">{listValue.title}</h1>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </Modal>
        </div>
    );
}