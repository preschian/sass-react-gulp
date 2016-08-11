import React    from 'react';
import ReactDOM from 'react-dom';

export class App extends React.Component {
    render() {
        return <h2>Aloha SASS + ReactJS + GulpJS 😆</h2>;
    }
}

ReactDOM.render(
    <App />,
    document.querySelector('#app')
);
