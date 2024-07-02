import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";

const DataPage = () => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const params = useParams();

    useEffect(() => {
        console.log("params: ", params.datasetName)
        fetch('/get/data/' + params.datasetName)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setError(error);
                setLoading(false);
            });
    }, [params]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    return (
        <div>
            <h1>Data</h1>
            <ul>
                {Object.entries(data).map(([k, attributes]) => (
                    <li key={k}>
                        <h2>{k}</h2>
                        <ul>
                            {Object.entries(attributes).map(([key, value]) => (
                                <li key={key}>{`${key}: ${value}`}</li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DataPage;