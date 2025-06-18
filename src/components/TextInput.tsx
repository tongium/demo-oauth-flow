interface Property {
    id: string
    value: any
    label: string

    onUpdate: (data: string) => void;
}

export default (props: Property) => {
    return (
        <div>
            <label for={props.id} class="block text-sm font-medium text-gray-300 mb-1 text-left">{props.label}</label>
            <input
                data-testid={props.id}
                type="text"
                id={props.id}
                value={props.value}
                class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200 ease-in-out"
                onInput={(e) => {
                    props.onUpdate(e.target.value);
                }}
            />
        </div>
    )
}