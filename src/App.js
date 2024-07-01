import {BrowserRouter as Router, Routes, Route, BrowserRouter} from 'react-router-dom';
import ReactDOM from "react-dom";
import App from './pages/datasets/info';
import EditAdd from './pages/datasets/edit_add'; // Adjust import path as necessary


ReactDOM.render((
    <BrowserRouter>
        <div>
            <Route exact path="/" component={App} />
            <Route path="/details" component={EditAdd} />
        </div>
    </BrowserRouter>
), document.getElementById('app'))


export default AppRouter;
