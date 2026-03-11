function FormInput({ label, ...props }) {
    return (
        <label>
            <div>{label}</div>
            <input {...props} />
        </label>
    )
}

export default FormInput
