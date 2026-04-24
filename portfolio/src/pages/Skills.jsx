import '../css/skills.css'
import c from '../assets/c.png'
import python from '../assets/icons8-python.gif'
import JS from '../assets/icons8-javascript.gif'
import RA from '../assets/react.svg'
import React from 'react'

function Skills(){

    const skills = [
        {name:"C",logo:c},
        {name:"PYTHON",logo:python},
        {name:"HTML & CSS",logo:null},
        {name:"JAVASCRIPT",logo:JS},
        {name:"REACT",logo:RA}
    ];
    

    

    return(
        <div id="skills">
            <h1 className='title'>Skills</h1>
            {skills.map((skill,index)=>(
                <div key={index} className='skill-card'>
                    <h1>{skill.name}</h1>
                    <img src={skill.logo} alt={skill.name}></img>
                </div>
            ))}
        </div>
    );
}

export default Skills;