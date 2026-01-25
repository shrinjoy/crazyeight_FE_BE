import pp1 from '../assets/pp1.png'

export interface profilepictureprop
{
highlight?:boolean
}



export function Profilepicture({highlight}: profilepictureprop) {
    return(
        <div 
            className={`rounded-full bg-center bg-no-repeat bg-cover w-[100px] h-[100px] ${highlight ? 'border-4 animate-pulse border-green-500' : 'border-1 border-white'}`}
            style={{ backgroundImage: `url(${pp1})` }}
        >
        </div>
    )
}