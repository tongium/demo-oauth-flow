interface TextInputProps {
    id: string
    value: string
    label: string
    onUpdate: (value: string) => void
}

/**
 * Minimalist Text Input
 * Uses a deep zinc background and subtle borders for a modern look.
 */
export default function TextInput(props: TextInputProps) {
    return (
        <div class="flex flex-col gap-1.5">
            <label for={props.id} class='text-[13px] font-medium text-zinc-400'>
                {props.label}
            </label>
            <input
                data-testid={props.id}
                type='text'
                id={props.id}
                value={props.value}
                class='w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all text-sm'
                onInput={(e) => {
                    props.onUpdate(e.target.value)
                }}
            />
        </div>
    )
}
