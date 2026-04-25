import '../css/skills.css'
import c from '../assets/c.png'
import python from '../assets/icons8-python.gif'
import JS from '../assets/icons8-javascript.gif'
import RA from '../assets/react.svg'
import React, { useState, useRef, useEffect } from 'react'

function Skills(){
    const [activeTab, setActiveTab] = useState('Languages');
    const cardRefs = useRef({});

    useEffect(() => {
        const handleMouseMove = (e) => {
            Object.values(cardRefs.current).forEach((card, index) => {
                if (card && card.matches(':hover')) {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    card.style.setProperty('--mouse-x', `${x}px`);
                    card.style.setProperty('--mouse-y', `${y}px`);
                }
            });
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const languages = [
        {name:"C", logo:c},
        {name:"Python", logo:python},
        {name:"JavaScript", logo:JS},
        {name:"HTML & CSS", logo:null}
    ];

    const technologies = [
        {name:"React", logo:RA},
        {name:"Node.js", logo:null},
        {name:"Express", logo:null}
    ];

    const tools = [
        {name:"Git", logo:null},
        {name:"VS Code", logo:null},
        {name:"Terminal", logo:null}
    ];

    const getSkillsByTab = (tab) => {
        switch(tab) {
            case 'Languages': return languages;
            case 'Technologies': return technologies;
            case 'Tools': return tools;
            default: return [];
        }
    };

    const tabs = ['Languages', 'Technologies', 'Tools'];
    const currentSkills = getSkillsByTab(activeTab);

    return(
        <div id="skills">
            <h1 className='title'>Skills</h1>

            <div className='tabs-container'>
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className='skills-grid'>
                {currentSkills.map((skill, index) => (
                    <div
                        key={index}
                        className='skill-card'
                        ref={el => cardRefs.current[index] = el}
                    >
                        <h3>{skill.name}</h3>
                        {skill.logo && (
                            <img
                                src={skill.logo}
                                alt={skill.name}
                                className="skill-logo"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Skills;
