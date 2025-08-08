import { useState,useEffect} from 'react';
import demo1 from '../assets/6174909.jpg'
import demo2 from '../assets/11613336.jpg'
import '../css/imgSlider.css'
import React from 'react';

function imgSlider(){

    const images = [demo1,demo2,demo1,demo2];
    const [index,setIndex] = useState(0);

    useEffect(()=>{
        const interval = setInterval(()=>{
            netImg();
        },3000);
        return()=>{
            clearInterval(interval)
        };
    },[index]);

    function netImg(){
        setIndex((i) => (i + 1) % images.length);
    }

    return(
        <div className="img-slider">
            <div className='image-flex' style={{transform: `translateX(-${index * 100}%)` }}>
                {images.map((img,index)=>(
                    <img className='img' key={index} src={img}/>
                ))}
            </div>
        </div>
    );
}

export default imgSlider