import {Link} from 'react-router-dom';


function NavBar(){
    
    return (
        <div id="navDiv">
            <nav id='mainNav' className="Nav">
                <div className="navbarLeft">
                    <a href="/" id="logoAnchorTag" className="logo"><img src='./imageassets/codeBeater.png'></img></a>
                </div>
                <div className="navbarCenter">
                <ul id='navCenterUl'>
                    <li className="navList" ><Link to="/">Home</Link></li>
                    <li className="navList" ><Link to="/about">About</Link></li>
                    <li className="navList" ><Link to="/resources">Resources</Link></li>
                    <li className="navList" ><Link to="/contact">Contact</Link></li>
                </ul>
                    
                </div>
        
                
            </nav>
        </div>
    );
}
export default NavBar;