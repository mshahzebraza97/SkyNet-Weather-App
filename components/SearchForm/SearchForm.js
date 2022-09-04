/* IMPORTS */

// DEPENDENCIES
import { useCallback, useEffect, useState } from 'react';
import useStore from '../../store/StoreContext';
import { setIsLoading, updateCurrentInvalid, updateCurrentValid } from '../../store/StoreDispatchers';

// LIBRARY FUNCTIONS & STYLES
import styles from './SearchForm.module.scss';

// COMPONENTS
import FormInput from './FormInput/FormInput';
import { FormControl } from './FormControl/FormControl';

/* BODY */
export default function SearchForm(props) {


    // State
    const [locationInput, setLocationInput] = useState('');
    const { state, dispatch } = useStore();
    const {
        currentSearch: {
            location: currentLocation
        },
    } = state;



    // Fetch Handler
    const fetchHandler = useCallback(async (location = 'Washington') => {

        try {

            const fetchURL = new URL("https://api.weatherapi.com/v1/current.json");
            console.log("fetchURL", fetchURL)
            fetchURL.searchParams.append('key', process.env.API_KEY);
            fetchURL.searchParams.append('q', location);
            fetchURL.searchParams.append('aqi', 'yes');

            // API Call
            const apiResponse = await fetch(fetchURL)
            // `https://api.weatherapi.com/v1/current.json?key=${process.env.API_KEY}&q=${location}&aqi=yes`

            // Good Response - fetch data and update the current weather & search history IF valid entry
            if (apiResponse.ok) {
                const apiJson = await apiResponse.json();

                // dispatch valid response - update current weather AND recent location
                dispatch(updateCurrentValid(apiJson))
            }

            // Bad Response - fetch error message and log to console IF invalid entry
            if (!apiResponse.ok) {

                const apiJson = await apiResponse.json()
                const { error: { message: errorMessage } } = apiJson;
                // dispatch invalid response - update the current weather data
                dispatch(updateCurrentInvalid(errorMessage))
                throw new Error(errorMessage);
            }

        } catch (error) {
            console.error(error);
        }

    }, [])

    // UseEffect
    useEffect(() => {
        fetchHandler() // On Startup, Call without specifying location
    }, [fetchHandler])

    // Submit Handler
    function submitHandler(e) {
        e.preventDefault();

        dispatch(setIsLoading(true));
        fetchHandler(locationInput); // location entered in text input
        dispatch(setIsLoading(false));

        setLocationInput('');
    }

    return (

        <form className={styles.form} action="#" onSubmit={submitHandler} >

            < FormInput
                label='Search Location'
                type='text'
                id='location'
                placeholder='Type the Location Name here'
                // errorText={'Invalid Input'} // will be dynamically fetched from the context or props
                isReq={true}
                value={locationInput}
                setValue={setLocationInput}
            />

            {/* <div className={styles.controlGroup}> */}
            <FormControl></FormControl>
            {/* </div> */}

        </form>
    )
}

SearchForm.displayName = `SearchForm`
