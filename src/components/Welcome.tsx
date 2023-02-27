import styles from '../App.module.css'
import logo from '../logo.svg';
import { useLogin } from '../hooks/auth'

export default () => {
    return (
        <div>
            <img src={logo} class={styles.logo} alt="logo" />
            <h1>
                Welcome to Bacon
            </h1>
            <p>
                Bacon is a type of salt-cured pork that is typically sliced thin and served as a breakfast food or used as an ingredient in various dishes.
                It is made from different cuts of pork, but typically comes from the belly or back of the pig.
                Bacon can be cooked in a variety of ways, including frying, baking, or grilling, and is known for its crispy texture and savory, smoky flavor.
                While bacon is a popular food around the world, it is often associated with American cuisine and is a staple of the classic American breakfast.
            </p>
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={useLogin}
            >
                Connect to FINNOMENA
            </button>
        </div>
    )
}