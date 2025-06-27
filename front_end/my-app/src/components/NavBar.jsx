import React from "react";

function NavBar(){
    return (
        <div id="navDiv">
            <nav id='mainNav' className="Nav">
                <div className="navbarLeft">
                    <a href="/" id="logoAnchorTag" className="logo"><img src='./imageassets/codeBeater.png'></img></a>
                </div>
                <div className="navbarCenter">
                <ul id='navCenterUl'>
                    <li className="navList"><a href="/">Home</a></li>
                    <li className="navList"><a href="/about">About</a></li>
                    <li className="navList"><a href="/resources">Resources</a></li>
                    <li className="navList"><a href="/contact">Contact</a></li>
                </ul>
                    
                </div>
                <div className="navbarRight">
                    <p>Other Logo</p>
                </div>
                
            </nav>
        </div>
    );
}
export default NavBar;