import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import { Card, Button, CardImg, CardColumns, CardBody } from 'reactstrap';
import Highlighter from 'react-highlight-words';

import PageIndex from '../../components/PageIndex/PageIndex.jsx';
import SearchBar from '../../components/SearchBar/SearchBar.jsx';

import './PhotoCards.css';

import logo from '../../logo.svg';
import axios from "axios/index";

/**
 * The Truck Photo model page
 * It display all the truck photo cards in a reactstrap CardColumns
 */
export default class TruckPhotoCards extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isNoResult: false,
            isLoading: true,
            data: [],
            citySelectValue: "",
            likeRange: 0,
            sorting: "",
            nPage: 1,
            page: 1,
            keywords: [],
            keywordsList: [],
            currentUrl: 'http://api.parkd.us/truck_photo?',
            currentUrlQueryParam: '',
            resultPerPage: 6,
        };
    }

    /* send request to fetch data when the page is loaded */
    componentDidMount() {
        const requestUrl = this.state.currentUrl
            + 'results_per_page=' + this.state.resultPerPage
            + '&'
            + 'page=' + this.state.page
            + '&'
            + this.state.currentUrlQueryParam;

        this.fetchData(requestUrl);
    }

    fetchData(requestURL){
        console.log(requestURL);
        requestURL = encodeURI(requestURL);
        console.log(requestURL);

        try{
            // initiate asynchronous network requests
            axios.get(requestURL)
                .then(res => {
                    this.updateCards(res.data)
                }).catch((error) => {
                this.setState({isLoading: false});
                console.log(error)
            });
        } catch (error){
            this.setState({isLoading: false});
            console.log("Error during fetching trucks data");
        }
    }

    /* update park photo data using the response from the server */
    updateCards(resData){
        this.setState({isLoading: false});
        let data = [];

        try{
            // get total page count
            const totalPage = resData['total_pages'];

            const photos = resData['objects'];
            if(photos.length === 0) {
                throw new Error('empty data');
            }

            for(let i=0; i<photos.length; i++){
                const photo = photos[i];

                let photoData = [];

                photoData.push(photo['tag']);    // get tag

                let url = photo['url'];
                photoData.push(url);

                let description = photo['description'];
                if(description.length > 200) {
                    description = description.substring(0, 200) + ' ...';
                }
                photoData.push(description);

                let id = photo['id'];
                photoData.push('photos/detail?id=' + id);

                let likes = photo['likes'];
                photoData.push(likes);

                data.push(photoData);
            }

            this.setState({data: data, nPage: totalPage, isNoResult: false});
        } catch (error){
            console.log("Error during parsing photos data - " + error.toString());
        }
    }

    /* Generate the card using the data */
    getCard(id){
        let data = this.state.data;

        return (
            <Card key={id} className={'shadowCard card'}>
                <CardImg top width="100%" className={'shadowImg'} src={data[id][1]} alt={data[id][0]}/>
                <CardBody>
                    {/* Card title */}
                    <div className={'photoCardTitleContainer'}>
                        <Highlighter
                            className={"photoCardTitle"}
                            unhighlightClassName={'photoCardTitle'}
                            highlightClassName={'photoCardTitle'}
                            highlightStyle={{"backgroundColor": "#F9FC48"}}
                            autoEscape={true}
                            searchWords={this.state.keywordsList}
                            textToHighlight={data[id][0]}
                        />
                    </div>
                    {/* Card body */}
                    <div className={'photoCardText card-text'}>
                        <br/>
                        <Highlighter
                            className={"photoCardText"}
                            unhighlightClassName={'photoCardText'}
                            highlightClassName={'photoCardText'}
                            highlightStyle={{"backgroundColor": "#F9FC48"}}
                            autoEscape={true}
                            searchWords={this.state.keywordsList}
                            textToHighlight={data[id][2]}
                        />
                        <br/>
                        <br/>
                        Likes: {data[id][4]}
                    </div>

                    {/* The 'More Info Button' */}
                    <br/>
                    <div className='buttonContainer'>
                        <Link to={data[id][3]}>
                            <Button className={"btn btn-info photoCardBtn"} color={"info"} size={'sm'}>
                                More Info
                            </Button>
                        </Link>
                    </div>
                </CardBody>
            </Card>
        );
    }

    /* Generate the photo cards group */
    getPhotoCards() {
        let cards = [];
        let i;
        for(i=0; i<this.state.data.length; i++){
            cards.push(this.getCard(i));
        }
        return cards;
    }

    /* handle the city filter condition changes */
    handleCitySelect(value) {
        this.setState({citySelectValue: value});
    }

    /* handle the like filter condition changes */
    handleLikeSelect(value) {
        if(value === null) value = 0;
        this.setState({likeRange: value});
    }

    /* handle the sorting condition changes */
    handleSortingSelect(value) {
        let preSoringString = this.state.sorting;
        let newSorting = value.split(",");

        // get the last sorting
        if(newSorting.length > 0){
            let sorting = newSorting[newSorting.length - 1];
            // test if there is any conflict
            if(sorting === 'Likes: Low to High' && newSorting.includes('Likes: High to Low')){
                value = preSoringString;
            } else if(sorting === 'Likes: High to Low' && newSorting.includes('Likes: Low to High')){
                value = preSoringString;
            } else if(sorting === 'City Name' && newSorting.includes('City Name A-Z')) {
                value = preSoringString;
            } else if(sorting === 'City Name A-Z' && newSorting.includes('City Name')) {
                value = preSoringString;
            } else if(sorting === 'Tag Name' && newSorting.includes('Tag Name A-Z')) {
                value = preSoringString;
            } else if(sorting === 'Tag Name A-Z' && newSorting.includes('Tag Name')) {
                value = preSoringString;
            }
        }
        this.setState({sorting: value});
    }

    /* handle the input event of the keywords Input */
    handleKeywords(value) {
        let keywordsList = [];
        for(let i=0; i<value.length; i++){
            keywordsList.push(value[i]['value']);
        }

        this.setState({keywords: value, keywordsList: keywordsList});
    }

    /* The search (filter) bar configuration */
    getSearchBarConfig () {
        return (
            [
                {
                    hasApplyButton: true,
                    createTable: false,
                    removeSelected: true,
                    isMulti: true,
                    disabled: false,
                    stayOpen: false,
                    handleSelect: this.handleCitySelect.bind(this),
                    value: this.state.citySelectValue,
                    options: [
                        { label: 'Austin', value: 'Austin' },
                        { label: 'Seattle', value: 'Seattle' },
                        { label: 'Portland', value: 'Portland' },
                    ],
                    rtl: false,
                    placeholder: 'City',
                },
                {
                    hasApplyButton: true,
                    createTable: false,
                    removeSelected: true,
                    isMulti: false,
                    disabled: false,
                    stayOpen: false,
                    handleSelect: this.handleLikeSelect.bind(this),
                    value: this.state.likeRange,
                    options: [
                        { label: 'Likes > 0', value: 0 },
                        { label: 'Likes > 10', value: 10 },
                        { label: 'Likes > 20', value: 20 },
                        { label: 'Likes > 50', value: 50 },
                        { label: 'Likes > 100', value: 100 },
                        { label: 'Likes > 300', value: 300 },
                        { label: 'Likes > 500', value: 500 },
                        { label: 'Likes > 1000', value: 1000 },
                        { label: 'Likes > 5000', value: 5000 },
                        { label: 'Likes > 10000', value: 10000 },
                        { label: 'Likes > 100000', value: 100000 },
                        { label: 'Likes > 500000', value: 500000 },
                        { label: 'Likes > 1000000', value: 1000000 },
                    ],
                    rtl: false,
                    placeholder: 'Likes',
                },
                {
                    hasApplyButton: true,
                    createTable: false,
                    removeSelected: true,
                    isMulti: true,
                    disabled: false,
                    stayOpen: false,
                    handleSelect: this.handleSortingSelect.bind(this),
                    value: this.state.sorting,
                    options: [
                        { label: 'Likes: Low to High', value: 'Likes: Low to High' },
                        { label: 'Likes: High to Low', value: 'Likes: High to Low' },
                        { label: 'City Name A-Z', value: 'City Name A-Z' },
                        { label: 'City Name', value: 'City Name' },
                        { label: 'Tag Name A-Z', value: 'Tag Name A-Z' },
                        { label: 'Tag Name', value: 'Tag Name' },
                    ],
                    rtl: false,
                    placeholder: 'Sorting',
                },
                {
                    createTable: true,
                    removeSelected: true,
                    isMulti: true,
                    disabled: false,
                    stayOpen: false,
                    handleSelect: this.handleKeywords.bind(this),
                    value: this.state.keywords,
                    options: [],
                    rtl: false,
                    placeholder: 'Keywords',
                },
            ]
        );
    }

    /* handle page index (page change) onClick event */
    handleOnPageBtnClick (pageIndex) {
        const currentUrl = this.state.currentUrl;
        const currentUrlPageParam = 'results_per_page='
            + this.state.resultPerPage
            + '&'
            + 'page=' + pageIndex;
        const currentUrlQueryParam = this.state.currentUrlQueryParam;

        const requestUrl = currentUrl
            + currentUrlPageParam
            + '&'
            + currentUrlQueryParam;

        this.setState({page: pageIndex, data: [], isNoResult: true, isLoading: true});
        this.fetchData(requestUrl);
    }

    /* handle the Apply button onClick event and generate the new query string */
    handleOnApplyFilterClick () {
        const keywords = this.state.keywords;
        const likes = this.state.likeRange;
        const cities = this.state.citySelectValue.split(',');
        const sortings = this.state.sorting.split(',');

        let requestUrl = 'http://api.parkd.us/truck_photo?page=1&'
            + 'results_per_page='
            + this.state.resultPerPage;

        let queryDict = {};
        let filterCondition = [];

        // rating filter
        filterCondition.push({name:"likes", op:"ge", val:likes});

        // city filter
        if(this.state.citySelectValue !== "" && cities.length > 0){
            let truckCityQuery = {name:"truck", op:"has", val:{name:"city", op:"in", val:cities}};
            filterCondition.push(truckCityQuery);
        }

        // keywords filter
        if(keywords.length > 0){
            const queryField = ['description', 'tag'];
            let keywordsCondition = [];

            for(let j=0; j<queryField.length; j++){
                for(let i=0; i<keywords.length; i++){
                    keywordsCondition.push({name: queryField[j], op:"like", val: '%'+keywords[i]['value']+'%'});
                }
            }

            let keywordsConditionQuery = {or: keywordsCondition};
            filterCondition.push(keywordsConditionQuery);
        }

        // dict to json string
        queryDict["filters"] = [{and: filterCondition}];

        // sorting
        if(this.state.sorting !== "" && sortings.length > 0){
            let sortingCondition = [];
            for(let i=0; i < sortings.length; i++){
                if(sortings[i] === 'Likes: Low to High'){
                    sortingCondition.push({field:"likes", direction:"asc"});
                } else if(sortings[i] === 'Likes: High to Low') {
                    sortingCondition.push({field:"likes", direction:"desc"});
                } else if(sortings[i] === 'City Name A-Z') {
                    sortingCondition.push({field:"truck__city", direction:"asc"});
                } else if(sortings[i] === 'City Name') {
                    sortingCondition.push({field:"truck__city", direction:"desc"});
                } else if(sortings[i] === 'Tag Name A-Z') {
                    sortingCondition.push({field:"tag", direction:"asc"});
                } else if(sortings[i] === 'Tag Name') {
                    sortingCondition.push({field:"tag", direction:"desc"});
                }
            }
            queryDict["order_by"] = sortingCondition;
        }

        // generate request url
        let queryUrl = 'q=' + JSON.stringify(queryDict);
        requestUrl += '&';
        requestUrl += queryUrl;

        this.setState({nPage: 1
            , page: 1
            , data: []
            , isLoading: true
            , currentUrlQueryParam: queryUrl
            , isNoResult: true});
        this.fetchData(requestUrl);
    }

    render(){
        let searchBarConfig = this.getSearchBarConfig();

        // handle the case when no result is found
        if(this.state.isNoResult && !this.state.isLoading) {
            return (
                <div>
                    <br/>
                    <SearchBar nSelect={4}
                               hasApplyButton={true}
                               config={searchBarConfig}
                               handleApplyFilterClick={this.handleOnApplyFilterClick.bind(this)}/>

                    <br/>
                    <div className={"loading"}>
                        <br/><br/><br/>
                        <h1>･({'>'}﹏{'<'})･ Result Not Found</h1>
                    </div>
                </div>
            );
        }

        // handle the case when the web page is loading the data
        if(this.state.data.length === 0 && this.state.isLoading){
            return (
                <div>
                    <br/>
                    <div className={"loading"}>
                        <img src={logo} className="App-logo" alt="logo" />
                        <br/>
                        <h1>Loading Page ...</h1>
                    </div>
                </div>
            );
        }

        // handle the case when the web page encounters any error
        if(this.state.data.length === 0 && !this.state.isLoading){
            return (
                <div>
                    <br/>
                    <div className={"loading"}>
                        <br/>
                        <h1>･({'>'}﹏{'<'})･ Error Loading Page ...</h1>
                    </div>
                </div>
            );
        }

        return (
            <div>
                <br/>
                <SearchBar nSelect={4}
                           hasApplyButton={true}
                           config={searchBarConfig}
                           handleApplyFilterClick={this.handleOnApplyFilterClick.bind(this)}/>

                <div className={'info-grid'}>
                    <br/>
                    <br/>
                    <div className="card-container container-fluid">
                        <CardColumns>
                            {this.getPhotoCards()}
                        </CardColumns>
                    </div>
                </div>

                <br/>
                <PageIndex page={this.state.page}
                           nPage={this.state.nPage}
                           handleOnPageBtnClick={this.handleOnPageBtnClick.bind(this)}/>

            </div>
        );
    }
}