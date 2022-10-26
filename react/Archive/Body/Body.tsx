import './Body.css'

export default function Body(props: {children: any})
{
    return (
        <div className="body_wrap">
            <div className="body">
                {props.children}
            </div>
        </div>
    )
}