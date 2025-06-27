import CardBody from "./CardBody"
export default function CardHeader(props) {
    return(
        <div>
            <h2>{props.name}</h2>
            <img src={props.src}/>
            <CardBody desc={props.desc}/>
        </div>
    )};
