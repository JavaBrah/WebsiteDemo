import CardBody from "./CardBody"
export default function CardHeader({name, imgSrc, desc}) {
    return(
        <div>
            <h2>{name}</h2>
            <img src={imgSrc}/>
            <CardBody desc={desc}/>
        </div>
    )};
