import { EvaluatedNode } from 'publicodes'
import Explanation from '../Explanation'
import { InfixMecanism } from './common/InfixMecanism'

export default function MecanismInférieur(node: EvaluatedNode<'inférieur'>) {
	return (
		<InfixMecanism value={node.explanation.valeur as EvaluatedNode}>
			<p>
				<strong>Arrondi inférieur : </strong>
				<Explanation node={node.explanation.inférieur} />
			</p>
		</InfixMecanism>
	)
}
