import React from "react";
import NavBar from "../components/NavBar";

function AboutPage(){
    return(
        <div className="aboutDiv">
            <NavBar/>
            <h1>About</h1>
            <img src='/imageassets/rustCult.png' />
        </div>
);
}
export default AboutPage;