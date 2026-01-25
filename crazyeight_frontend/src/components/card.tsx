import type React from 'react'


export interface cardproperties {
    className?: string,
    id?: string
    imgname?:string
    style?: React.CSSProperties
    clickable:boolean
    onclick?: () => void,
    onMouseleave?: () => void
}




export function Card({ className = "",clickable=false, id,imgname="BK", style, onclick = () => { }, onMouseleave = () => { } }: cardproperties) {


    const getcardimage=()=>
    {
       
       
            try{
                console.log("card img found"+imgname)
                return new URL(`../assets/card/${imgname}.svg`,import.meta.url).href;
               

            }
            catch
            {
                console.log("card not found going to default"+imgname)
            return new URL(`../assets/card/BK.svg`,import.meta.url).href;

            }
        
    }

    const backgroundimage = getcardimage();
    return (<div style={{...style,
        backgroundImage:`url(${backgroundimage})`,
         backgroundSize: 'contain',  
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
    }} id={`${id}`} className={`${className} card rounded-[20px]`} onMouseLeave={() => {
       clickable? onMouseleave?.():()=>{};
    }} onMouseDown={() => {clickable?onclick?.():()=>{}; }} onClick={(e) => { e.stopPropagation() }} >

        
    </div>)
}