import { Link } from 'react-router-dom';

function FileNotFound(){
    return(
        <div className='flex flex-row'>
            <h1>This Link doesn't exist</h1>
            <Link to={'/'}>
                <button>Go Back Home</button>
            </ Link>
        </div>
    );
}
export default FileNotFound;