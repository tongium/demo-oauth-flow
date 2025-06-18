interface Property {
    id: string
    value: any
    label: string
}

export default (props: Property) => {
    const copy = () => {
        navigator.clipboard.writeText(props.value)
    }

    return (
        <div class="group relative my-2">
            <label for="callback-url" class="block text-sm py-1 font-medium text-gray-300 text-left">{props.label}</label>
            <input
                data-testid={props.id}
                id={props.id}
                type="text"
                class="w-full cursor-pointer px-4 py-2 bg-gray-700 border text-gray-500 border-gray-600 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition duration-200 ease-in-out"
                value={props.value}
                onClick={copy}
                readonly
            />
            <span
                class="absolute text-sm top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-500 whitespace-nowrap"
            >
                Click to Copy
            </span>
        </div>
    )
}
